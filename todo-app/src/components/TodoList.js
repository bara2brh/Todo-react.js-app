/** 
Fixes:

**/ 
    /**
     * todo : 
     * make the code cleaner
     * a11y test
     * create change language - (need to check after finishing)
     * show statistics for each section (last time finished, number of completed ,number of in progress)
     * styling whole project
     * 
     */
import React, { useState ,useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LocalizedStrings from 'react-localization';
import Popup from './Popup.js';
import Strings from '../locale/langs.js'
import { useAuth } from '../AuthProvider.js';
import { AuthProvider } from '../AuthProvider';
import { db, doc, setDoc ,getDocs,updateDoc , deleteDoc ,addDoc,collection } from '../firebase';


const TodoList = () => {
    // State hooks
    const { currentUser } = useAuth();
    const storedSections = JSON.parse(localStorage.getItem('sections'))
    const [sections, setSections] = useState([]);
    const [sectionInput, setSectionInput] = useState('');
    const [todoInput, setTodoInput] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [priorityInput, setPriorityInput] = useState('Important');
    const [selectedSection, setSelectedSection] = useState(0);
    const [toggleInput, setToggleInput] = useState(false);
    const [isEditingTodo, setIsEditingTodo] = useState(false);
    const [isEditingSection, setIsEditingSection] = useState(false);
    const [editSectionInput , seteditSectionInput ] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [resureIsOpen, setResureIsOpen] = useState(false);
    const [editTodoInput, setEditTodoInput] = useState('');
    const [editTimeInput, seteditTimeInput] = useState('');
    const [editTodoIndex, seteditTodoIndex] = useState(0);
    const [editSectionIndex, seteditSectionIndex] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [language, setLanguage] = useState('');
    const getUid = localStorage.getItem('uid');
    const [isGuestMode, setIsGuestMode] = useState(() => JSON.parse(localStorage.getItem('guestMode')) || false);


    useEffect(() => {
        const guestMode = JSON.parse(localStorage.getItem('guestMode')) || false;
        setIsGuestMode(guestMode);
        const fetchSectionsAndTodos = async () => {
            if (currentUser && getUid && !guestMode) {
                const userDocRef = doc(db, 'users', getUid);
                const sectionsSubcollectionRef = collection(userDocRef, 'sections');
                const sectionsSnapshot = await getDocs(sectionsSubcollectionRef);
                const sectionsData = await Promise.all(sectionsSnapshot.docs.map(async (sectionDoc) => {
                    const sectionData = { id: sectionDoc.id, ...sectionDoc.data() };
                    const todosSubcollectionRef = collection(sectionDoc.ref, 'todos');
                    const todosSnapshot = await getDocs(todosSubcollectionRef);
                    const todos = todosSnapshot.docs.map(todoDoc => ({
                        id: todoDoc.id,
                        ...todoDoc.data()
                    }));
                    return { ...sectionData, todos };
                }));
                setSections(sectionsData);
            } else {
                setSections(storedSections ?? []);
            }
        };
    
        fetchSectionsAndTodos();
    }, [currentUser, getUid]);
    
    // Utility functions for time format conversion
    const convertTo12HourFormat = (time) => {
        const [hours, minutes] = time.split(':');
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const adjustedHours = hours % 12 || 12;
        return `${adjustedHours}:${minutes} ${suffix}`;
    };

    const convertTo24HourFormat = (time) => {
        const [hours, minutes] = time.split(':');
        const editedMinutes = minutes.substring(0, minutes.length - 3);
        const suffix = time.substring(time.length - 2, time.length);
        const isDay = suffix === 'AM';
        if (!isDay && hours !== '12') {
            const editedHours = Number(hours) + 12;
            return `${editedHours}:${editedMinutes}`;
        } else if (isDay && hours === '12') {
            return `00:${editedMinutes}`;
        } else {
            const editedHours = hours.length === 2 ? hours : '0' + hours;
            return `${editedHours}:${editedMinutes}`;
        }
    };

    // Toggle functions
    const togglePopup = () => {
        setIsEditingTodo(!isEditingTodo);
        setIsOpen(!isOpen);
    } 
    const toggleResurePopup = () => setResureIsOpen(!resureIsOpen);
    const togglePopupSectionEdit = () => setIsEditingSection(!isEditingSection);
    const handleToggleInput = () => setToggleInput(!toggleInput);

    // Input change handlers
    const handleSectionInputChange = (event) => {
        isEditingSection ? seteditSectionInput (event.target.value) : setSectionInput(event.target.value);
    };

    const handleTodoInputChange = (event) => {
        isEditingTodo ? setEditTodoInput(event.target.value) : setTodoInput(event.target.value);
    };

    const handleTimeInputChange = (event) => {
        isEditingTodo ? seteditTimeInput(event.target.value) : setTimeInput(event.target.value);
    };

    const handlePrioritySelection = (event) => {
        setPriorityInput(event.target.value);
    };

    // Add, edit, delete section handlers
    const handleAddSection = async () => {
        if (!currentUser && isGuestMode) {
            // If the user is not logged in, add a new section locally
            if (sections.length === 0) setSelectedSection(0);
            if (sectionInput.trim() !== '') {
                const newSections = [...sections, { title: sectionInput, todos: [] }];
                setSections(newSections);
                setSectionInput('');
                localStorage.setItem('sections', JSON.stringify(newSections));
            }
        } else {
            // If the user is logged in, add a new section to Firestore
            try {
                const userDocRef = doc(db, 'users', getUid);
                const sectionsSubcollectionRef = collection(userDocRef, 'sections');
                const sectionData = {
                    title: sectionInput,
                    todos: [], // Ensure todos is initialized as an empty array
                };
    
                // Add a new document with an auto-generated ID
                await addDoc(sectionsSubcollectionRef, sectionData);
    
                console.log('Section successfully added!');
    
                // Fetch the updated sections from Firestore
                const sectionsSnapshot = await getDocs(sectionsSubcollectionRef);
                const sectionsData = sectionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setSections(sectionsData);
                setSectionInput('');
            } catch (error) {
                console.error('Error adding section: ', error);
            }
        }
    };

    const handleEditSection = (sectionIndex) => {
        togglePopupSectionEdit();
        seteditSectionIndex(sectionIndex);
        seteditSectionInput (sections[sectionIndex]?.title || '');
    };

    const handleEditSectionSubmit = async (sectionIndex, text) => {
        const updatedSections = [...sections];

        if (!currentUser && isGuestMode) {
            updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], title: text };
            setSections(updatedSections);
            localStorage.setItem('sections', JSON.stringify(updatedSections));
        } else {
            const sectionId = updatedSections[sectionIndex].id;
            const sectionDocRef = doc(db, 'users', getUid, 'sections', sectionId);
            await updateDoc(sectionDocRef, {
                title: text,
            });

            updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], title: text };
            setSections(updatedSections);
        }

        togglePopupSectionEdit();
    
    };

    const handleDeleteSection = (sectionIndex) => {
        setDeleteTarget({ type: 'section', sectionIndex });
        setResureIsOpen(true);
    };

    // Add, edit, delete todo handlers
    const handleAddTodo = async (sectionIndex) => {
        if (todoInput.trim() !== '' && timeInput.trim() !== '') {
            const updatedSections = [...sections];
    
            if (!currentUser && isGuestMode) {
                updatedSections[sectionIndex]?.todos.push({
                    text: todoInput,
                    time: convertTo12HourFormat(timeInput),
                    priority: priorityInput,
                    status: 'incomplete',
                });
                setSections(updatedSections);
                localStorage.setItem('sections', JSON.stringify(updatedSections));
    
                setTodoInput('');
                setTimeInput('');
            } else {
                const sectionId = updatedSections[sectionIndex].id;
                const sectionDocRef = doc(db, 'users', getUid, 'sections', sectionId);
                const todosSubcollectionRef = collection(sectionDocRef, 'todos');
                const todo = { 
                    text: todoInput,
                    time: convertTo12HourFormat(timeInput),
                    priority: priorityInput,
                    status: 'incomplete',
                };
    
                // Add the new todo to Firestore
                await addDoc(todosSubcollectionRef, todo);
    
                // Fetch the updated sections
                const sectionsSnapshot = await getDocs(collection(sectionDocRef, 'todos'));
                const todos = sectionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
    
                updatedSections[sectionIndex].todos = todos;
    
                setSections(updatedSections);
                setTodoInput('');
                setTimeInput('');
            }
        }
    };

    const handleEditTodo = (sectionIndex, todoIndex) => {
        togglePopup();
        seteditSectionIndex(sectionIndex);
        seteditTodoIndex(todoIndex);
        const { text, time } = sections[sectionIndex]?.todos[todoIndex] || {};
        setEditTodoInput(text || '');
        seteditTimeInput(convertTo24HourFormat(time || ''));
    };

    const handleEditSubmit = async(text, time, sectionIndex, todoIndex) => {
        if (!currentUser && isGuestMode) {
            const updatedSections = [...sections];
            updatedSections[sectionIndex].todos[todoIndex] = {
                text,
                time: convertTo12HourFormat(time),
            };
            setSections(updatedSections);
            localStorage.setItem('sections', JSON.stringify(updatedSections));
         

        }
        else
        {
            const updatedSections = [...sections];
            const sectionId = updatedSections[sectionIndex].id;
            const todoId = updatedSections[sectionIndex].todos[todoIndex].id;
            const todoDocRef = doc(db, 'users', getUid, 'sections', sectionId,'todos',todoId);
            await updateDoc(todoDocRef, {
                text: text,
                time: convertTo12HourFormat(time),
            });

            updatedSections[sectionIndex].todos[todoIndex] = { ...updatedSections[sectionIndex].todos[todoIndex], text: text,time: convertTo12HourFormat(time),
            };
            setSections(updatedSections);
        }
        setIsEditingTodo(false);
        togglePopup();

    };

    const handleDeleteTodo = (sectionIndex, todoIndex) => {
        if (sections[sectionIndex]?.todos) {
            setDeleteTarget({ type: 'todo', sectionIndex, todoIndex });
            setResureIsOpen(true);
        }
    };

    const handleDeleteConfirmation = async () => {
        if (deleteTarget.type === 'section') {
         if (!currentUser && isGuestMode)
         {
             const { sectionIndex } = deleteTarget;
            const updatedSections = [...sections];
            updatedSections.splice(sectionIndex, 1);
            setSections(updatedSections);
            localStorage.setItem('sections', JSON.stringify(updatedSections));
         }
         else {
            const { sectionIndex } = deleteTarget;
            const curSections = [...sections];
            const sectionId = curSections[sectionIndex].id;
            const sectionDocRef = doc(db, 'users', getUid, 'sections', sectionId);
            const todosSubcollectionRef = collection(sectionDocRef, 'todos');
            const todosSnapshot = await getDocs(todosSubcollectionRef);

            const deleteTodosPromises = todosSnapshot.docs.map(todoDoc => deleteDoc(todoDoc.ref));
            await Promise.all(deleteTodosPromises);
            await deleteDoc(sectionDocRef);

            const updatedSections = curSections.filter(section => section.id !== sectionId);
            setSections(updatedSections);
         }
        }
        if (deleteTarget.type === 'todo') {
            if (!currentUser && isGuestMode)
             {
                const { sectionIndex, todoIndex } = deleteTarget;
                const updatedSections = [...sections];
                updatedSections[sectionIndex]?.todos.splice(todoIndex, 1);
                setSections(updatedSections);
                localStorage.setItem('sections', JSON.stringify(updatedSections));
             }
            else
            {
                const { sectionIndex, todoIndex } = deleteTarget;
                const curSections = [...sections];
                const sectionId = curSections[sectionIndex].id;
                const todoId = curSections[sectionIndex].todos[todoIndex].id;
                const todoDocRef = doc(db, 'users', getUid, 'sections', sectionId,'todos',todoId); 
                await deleteDoc(todoDocRef);
                const sectionDocRef = doc(db, 'users', getUid, 'sections', sectionId); 
                const sectionsSnapshot = await getDocs(collection(sectionDocRef, 'todos'));
                const todos = sectionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                curSections[sectionIndex].todos = todos;
                setSections(curSections);
            }

        }
        setResureIsOpen(false);
    };

    const toggleTodoCompleted =async (sectionIndex, todoIndex) => {
        if (!currentUser && isGuestMode) {
            const updatedSections = [...sections];
            const statusCheck = updatedSections[sectionIndex]?.todos[todoIndex].status;
            updatedSections[sectionIndex].todos[todoIndex].status = statusCheck === 'completed' ? 'incomplete' : 'completed';
            setSections(updatedSections);
            localStorage.setItem('sections', JSON.stringify(updatedSections));
        }
        else{
            const updatedSections = [...sections];
            const statusCheck = updatedSections[sectionIndex]?.todos[todoIndex].status;
            const sectionId = updatedSections[sectionIndex].id;
            const todoId = updatedSections[sectionIndex].todos[todoIndex].id;
            const todoDocRef = doc(db, 'users', getUid, 'sections', sectionId,'todos',todoId);
            await updateDoc(todoDocRef, {
                status: statusCheck === 'completed' ? 'incomplete' : 'completed',
            });
            updatedSections[sectionIndex].todos[todoIndex].status = statusCheck === 'completed' ? 'incomplete' : 'completed';
            setSections(updatedSections);
        }
    };

    const handleSectionClick = (sectionIndex) => {
        setSelectedSection(sectionIndex);
    };

    // Drag and drop handler
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

        const updatedSections = [...sections];
        const sourceIndex = selectedSection;
        const destinationIndex = selectedSection;

        if (sourceIndex === destinationIndex) {
            const sectionTodos = updatedSections[sourceIndex]?.todos || [];
            const [movedTodo] = sectionTodos.splice(source.index, 1);
            sectionTodos.splice(destination.index, 0, movedTodo);
            updatedSections[sourceIndex].todos = sectionTodos;
        }
        setSections(updatedSections);
        localStorage.setItem('sections', JSON.stringify(updatedSections));

    };

    // Change Language 
    const changeLanguge= ()=>{
      const currentLanguage = Strings.getLanguage();
      Strings.setLanguage(currentLanguage==='ar'?"en":'ar');
      setLanguage(currentLanguage);
    }
        return (
            <>
                <header>
                    <h1>{Strings.headerTitle}</h1>
                    <button onClick={changeLanguge}></button>
                </header>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="container">
                        <div className="sections">
                            <h2>{Strings.sections}</h2>
                            <ul>
                                {sections.map((section, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSectionClick(index)}
                                        className={selectedSection === index ? 'active' : ''}
                                    >
                                        {section.title} <button className='icon-button edit' onClick={() => handleEditSection(index)}> <i class="fas fa-pen"/></button>
                                        <button className='icon-button delete' onClick={() => handleDeleteSection(index)}><i class="fa-solid fa-circle-minus"/></button>
                                    </li>
                                ))}
                            </ul>
                            <div className="add-section">
                                <a href="#!" onClick={handleToggleInput}>
                                    <img src={require(!toggleInput ? "../img/plus.svg" : "../img/minus.svg").default} alt="" />
                                </a>
                                {toggleInput ? (
                                    <div>
                                        <input type="text" value={sectionInput} onChange={handleSectionInputChange} placeholder={Strings.sectionAdd} />
                                        <button onClick={handleAddSection}>{Strings.sectionAdd}</button>
                                    </div>
                                ) : (
                                    <h4>{Strings.sectionAdd}</h4>
                                )}
                            </div>
                        </div>
                        <div className="todos">
                            {sections.length > 0 && sections[selectedSection]?.todos && (
                                <>
                                    <h2>{sections[selectedSection]?.title || ''}</h2>
                                    <input
                                        type="text"
                                        value={todoInput}
                                        onChange={handleTodoInputChange}
                                        placeholder={`Add new todo for ${sections[selectedSection]?.title || ''}`}
                                    />
                                    <input aria-label="Time" type="time" value={timeInput} onChange={handleTimeInputChange} />
                                    <select name="priority" onChange={handlePrioritySelection} id="priority">
                                    <option value={'high'}>{Strings.high}</option>
                                    <option value={'medium'}>{Strings.medium}</option>
                                    <option value={'low'}>{Strings.low}</option>
                                    </select>
                                  
                                    <button onClick={() => handleAddTodo(selectedSection)}>Add</button>
                                    <Droppable droppableId={`section-${selectedSection}`} direction="vertical">
                                        {(provided) => (
                                            <ul ref={provided.innerRef} {...provided.droppableProps}>
                                                {sections[selectedSection]?.todos.map((todo, index) => (
                                                    <Draggable key={index} draggableId={`todo-${selectedSection}-${index}`} index={index}>
                                                        {(provided) => (
                                                            <li
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                {todo.text} - {todo.time} - {todo.status} - {todo.priority}
                                                                <div onClick={() => toggleTodoCompleted(selectedSection, index)}>
                                                                    {todo.status === 'completed' ? (
                                                                        <i className="icon fa-regular fa-circle-check"></i>
                                                                    ) : (
                                                                        <i className="fa-regular fa-circle"></i>
                                                                    )}
                                                                </div>
                                                                <button onClick={() => handleDeleteTodo(selectedSection, index)}>Delete</button>
                                                                <button onClick={() => handleEditTodo(selectedSection, index)}>Edit</button>
                                                            </li>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </ul>
                                        )}
                                    </Droppable>
                                </>
                            )}
                            {sections.length === 0 && <h2>{Strings.selectSection}</h2>}
                        </div>
                    </div>
                    
                </DragDropContext>
                <Popup isOpen={isOpen} togglePopup={togglePopup}>
                    <input
                        type="text"
                        value={editTodoInput}
                        onChange={handleTodoInputChange}
                    />
                    <input aria-label="Time" type="time" value={editTimeInput} onChange={handleTimeInputChange} />
                    <button onClick={() => handleEditSubmit(editTodoInput, editTimeInput, editSectionIndex, editTodoIndex)}>Submit</button>
                </Popup>
                <Popup isOpen={isEditingSection} togglePopup={togglePopupSectionEdit}>
                    <input
                        type="text"
                        value={editSectionInput}
                        onChange={handleSectionInputChange}
                    />
                    <button onClick={() => handleEditSectionSubmit(editSectionIndex, editSectionInput )}>Submit</button>
                </Popup>
                <Popup isOpen={resureIsOpen} togglePopup={toggleResurePopup}>
                    <h1>Are You Sure?</h1>
                    <h3>{deleteTarget?.type === "section" ? `This will delete the whole section! ` : `This will delete the todo and can't be undone`}</h3>
                    <button onClick={handleDeleteConfirmation}>Submit</button>
                </Popup>
            </>
        );
    };
    
    export default TodoList;
    