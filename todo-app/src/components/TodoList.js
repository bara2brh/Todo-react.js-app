/** 
Fixes:
* fix drag and drop errors
* fix completed and incomplete after editing the todo

**/ 
    /**
     * todo : 
     * make the code cleaner
     * a11y test
     * add nodejs to it with google sign in
     * store todo's to the database
     * create change language - (need to check after finishing)
     * show statistics for each section (last time finished, number of completed ,number of in progress)
     * styling whole project
     * 
     */
    import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import LocalizedStrings from 'react-localization';
import Popup from './Popup.js';
import Strings from '../locale/langs.js'

const TodoList = () => {
    // State hooks
    const storedSections = JSON.parse(localStorage.getItem('sections'))
    const [sections, setSections] = useState(storedSections??[]);
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
    const togglePopup = () => setIsOpen(!isOpen);
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
    const handleAddSection = () => {
        if (sections.length === 0) setSelectedSection(0);
        if (sectionInput.trim() !== '') {
            const newSections = [...sections, { title: sectionInput, todos: [] }];
            setSections(newSections);
            setSectionInput('');
            localStorage.setItem('sections', JSON.stringify(newSections));
        }
        

    };

    const handleEditSection = (sectionIndex) => {
        togglePopupSectionEdit();
        seteditSectionIndex(sectionIndex);
        seteditSectionInput (sections[sectionIndex]?.title || '');
    };

    const handleEditSectionSubmit = (sectionIndex, text) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], title: text };
        setSections(updatedSections);
        localStorage.setItem('sections', JSON.stringify(updatedSections));
        togglePopupSectionEdit();
    };

    const handleDeleteSection = (sectionIndex) => {
        setDeleteTarget({ type: 'section', sectionIndex });
        setResureIsOpen(true);
    };

    // Add, edit, delete todo handlers
    const handleAddTodo = (sectionIndex) => {
        if (todoInput.trim() !== '' && timeInput.trim() !== '') {
            const updatedSections = [...sections];
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
        }
    };

    const handleEditTodo = (sectionIndex, todoIndex) => {
        togglePopup();
        seteditSectionIndex(sectionIndex);
        seteditTodoIndex(todoIndex);
        const { text, time } = sections[sectionIndex]?.todos[todoIndex] || {};
        setEditTodoInput(text || '');
        setIsEditingTodo(true);
        seteditTimeInput(convertTo24HourFormat(time || ''));
    };

    const handleEditSubmit = (text, time, sectionIndex, todoIndex) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].todos[todoIndex] = {
            text,
            time: convertTo12HourFormat(time),
        };
        setSections(updatedSections);
        localStorage.setItem('sections', JSON.stringify(updatedSections));
        setIsEditingTodo(false);

        togglePopup();
    };

    const handleDeleteTodo = (sectionIndex, todoIndex) => {
        if (sections[sectionIndex]?.todos) {
            setDeleteTarget({ type: 'todo', sectionIndex, todoIndex });
            setResureIsOpen(true);
        }
    };

    const handleDeleteConfirmation = () => {
        if (deleteTarget.type === 'section') {
            const { sectionIndex } = deleteTarget;
            const updatedSections = [...sections];
            updatedSections.splice(sectionIndex, 1);
            setSections(updatedSections);
            localStorage.setItem('sections', JSON.stringify(updatedSections));

        }
        if (deleteTarget.type === 'todo') {
            const { sectionIndex, todoIndex } = deleteTarget;
            const updatedSections = [...sections];
            updatedSections[sectionIndex]?.todos.splice(todoIndex, 1);
            setSections(updatedSections);
            localStorage.setItem('sections', JSON.stringify(updatedSections));

        }
        setResureIsOpen(false);
    };

    const toggleTodoCompleted = (sectionIndex, todoIndex) => {
        const updatedSections = [...sections];
        const statusCheck = updatedSections[sectionIndex]?.todos[todoIndex].status;
        updatedSections[sectionIndex].todos[todoIndex].status = statusCheck === 'completed' ? 'incomplete' : 'completed';
        setSections(updatedSections);
        localStorage.setItem('sections', JSON.stringify(updatedSections));

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
      Strings.setLanguage(currentLanguage=='ar'?"en":'ar');
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
                                        {section.title} <button onClick={() => handleEditSection(index)}>Edit</button>
                                        <button onClick={() => handleDeleteSection(index)}>Delete</button>
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
    