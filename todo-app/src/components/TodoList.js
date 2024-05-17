import React from 'react';
import Popup from './Popup.js';

const { useState , useEffect  } = React;

const TodoList = () => {
    const [sections, setSections] = useState([]);
    const [sectionInput, setSectionInput] = useState('');
    const [todoInput, setTodoInput] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [selectedSection, setSelectedSection] = useState(0);
    const [toggleInput, setToggleInput] = useState(false);
    const [isEditingTodo, setIsEditingTodo] = useState(false);
    const [isEditingSection, setIsEditingSection] = useState(false);
    const [EditSectionInput, setEditSectionInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [resureIsOpen, setResureIsOpen] = useState(false);
    const [EditTodoInput, setEditTodoInput] = useState('');
    const [EditTimeInput, setEditTimeInput] = useState('');
    const [EditTodoIndex, setEditTodoIndex] = useState(0);
    const [EditSectionIndex, setEditSectionIndex] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState(null);

    /**
     * todo : 
     * mark the todo as completed or in progress - Done
     * styling whole project
     * enable reordering the todo's
     * add priority colors
     * make the code cleaner
     * add nodejs to it with google sign in
     * store todo's to the database
     * create dark mode
     * create change language
     * show statistics for each section (last time finished, number of completed ,number of in progress)
     * 
     */
    const togglePopup = () => {
      setIsOpen(!isOpen);
      setIsEditingTodo(!isEditingTodo);
    };
    const toggleResurePopup = () => {
        setResureIsOpen(!resureIsOpen);
      };
    const togglePopupSectionEdit = () => {
        setIsEditingSection(!isEditingSection);

      };
    const handleSectionInputChange = (event) => {
        {isEditingSection ? setEditSectionInput(event.target.value) 
            : setSectionInput(event.target.value);}
    };

    const handleToggleInput = () => {
        setToggleInput(!toggleInput);
    }

    const handleTodoInputChange = (event) => {
        {isEditingTodo ? setEditTodoInput(event.target.value) 
        : setTodoInput(event.target.value);}
    };

    const handleTimeInputChange = (event) => {
        {isEditingTodo ? setEditTimeInput(event.target.value) 
            : setTimeInput(event.target.value);}
    }

    const handleAddSection = () => {
        if (sections.length === 0) {
            setSelectedSection(0); 
        }
        if (sectionInput.trim() !== '') {
            setSections([...sections, { title: sectionInput, todos: [] }]);
            setSectionInput('');
            setTimeInput('');

        }
    };
    const handleEditSection = (sectionIndex)=>{
        togglePopupSectionEdit();
        setEditSectionIndex(sectionIndex);
        const updatedSections = [...sections];
        setEditSectionInput(updatedSections[sectionIndex].title);

    }
    const handleEditSectionSubmit=(sectionIndex,text)=>{
        const updatedSections = [...sections];
        const sectionTodos = updatedSections[sectionIndex].todos;
        updatedSections.splice(sectionIndex, 1,{title:text,todos:sectionTodos});
        setSections(updatedSections);
        togglePopupSectionEdit();
    }
    
    const handleEditTodo = (sectionIndex, todoIndex) => {
        togglePopup();
        setEditSectionIndex(sectionIndex);
        setEditTodoIndex(todoIndex);
        const updatedSections = [...sections];
        const text =  updatedSections[sectionIndex].todos[todoIndex].text;
        const time =  updatedSections[sectionIndex].todos[todoIndex].time;
        setEditTodoInput(text);
        setEditTimeInput(convertTo24HourFormat(time));
        
       
    }
    const handleEditSubmit=(text,time,sectionIndex,todoIndex)=>{
        togglePopup();
        const updatedSections = [...sections];
        updatedSections[sectionIndex].todos.splice(todoIndex, 1,{text:text,time:convertTo12HourFormat(time)});
        setSections(updatedSections);
        setEditSectionInput('');
    }

    const handleDeleteTodo = (sectionIndex, todoIndex) => {
        setDeleteTarget({type: 'todo', sectionIndex, todoIndex});
        setResureIsOpen(true);
    };
    const handleDeleteSection = (sectionIndex) => {
        setDeleteTarget({type: 'section', sectionIndex});
        setResureIsOpen(true);
    };

    useEffect(() => {
      
        if (selectedSection !== null && sections[selectedSection] === undefined) {
            setSelectedSection(selectedSection-1);
        }
    }, [sections]);

    const handleAddTodo = (sectionIndex) => {
        if (todoInput.trim() !== '' && timeInput.trim()!=='') {
            const updatedSections = [...sections];
            updatedSections[sectionIndex].todos.push({ text: todoInput, time: convertTo12HourFormat(timeInput),status:'incomplete' });
            setSections(updatedSections);
            setTodoInput('');
            setTimeInput('');
        }
    };
    const toggleTodoCompleted= (sectionIndex,todoIndex)=>{
        const updatedSections = [...sections];
        const statusCheck =   updatedSections[sectionIndex].todos[todoIndex].status
        if (statusCheck==='completed')
            {
                updatedSections[sectionIndex].todos[todoIndex].status = 'incomplete';
            }
            else
            {
                updatedSections[sectionIndex].todos[todoIndex].status = 'completed';

            }
        setSections(updatedSections);
    }

    const handleSectionClick = (sectionIndex) => {
          setSelectedSection(sectionIndex);
    };

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

    const handleDeleteConfirmation = ()=>{
        if (deleteTarget.type==='section') {
            const { sectionIndex } = deleteTarget;
            const updatedSections = [...sections];
            updatedSections.splice(sectionIndex, 1);
            setSections(updatedSections);
        }

        if(deleteTarget.type==='todo') {
            const { sectionIndex, todoIndex } = deleteTarget;
            const updatedSections = [...sections];
            updatedSections[sectionIndex].todos.splice(todoIndex, 1);
            setSections(updatedSections);
        }
        setResureIsOpen(false);
    }

    return (
        <>
            <header>
                <h1>Todo List</h1>
            </header>
            <div className="container">
                <div className="sections">
                    <h2>Sections</h2>
                    <ul>
                        {sections.map((section, index) => (
                            <li key={index} onClick={() => handleSectionClick(index)} className={selectedSection === index ? 'active' : ''}>
                                {section.title||''} <button onClick={()=>handleEditSection(index)}>Edit</button>
                                <button onClick={()=>handleDeleteSection(index)}>Delete</button>


                            </li>
                        ))}
                    </ul>
                    <div>
                        
                        <a onClick={handleToggleInput}>
                            <img src={require(!toggleInput?"../img/plus.svg":"../img/minus.svg").default} alt="" />

                        </a>
                        {toggleInput ?
                            <div>
                                <input
                                    type="text"
                                    value={sectionInput}
                                    onChange={handleSectionInputChange}
                                    placeholder="Add new section"
                                />
                                <button onClick={handleAddSection}>Add Section</button>

                            </div>
                            :
                            <h4> Add Section </h4>
                        }

                    </div>
                </div>
                <div className="todos">

                    {sections.length > 0 && (
                        <>
                            <h2>{sections[selectedSection]?.title||''}</h2>
                                <input
                                type="text"
                                value={todoInput}
                                onChange={handleTodoInputChange}
                                placeholder={`Add new todo for ${sections[selectedSection]?.title||'' }`}
                            />
                            <input aria-label="Time" type="time" value={timeInput} onChange={handleTimeInputChange} />

                            <button onClick={() => handleAddTodo(selectedSection)}>Add</button>

                            <ul>
                                {sections[selectedSection]?.todos.map((todo, index) => (
                                    <li key={index}>
                                        {todo.text} - {todo.time} - {todo.status} 
                                        <div onClick={() => toggleTodoCompleted(selectedSection,index)}>{todo.status==='completed'?<i class="icon fa-regular fa-circle-check"></i>:<i class="fa-regular fa-circle"></i>}</div>
                                        <button onClick={() => handleDeleteTodo(selectedSection, index)}>Delete</button>
                                        <button onClick={()=>handleEditTodo(selectedSection, index)}>Edit</button>

                                    </li>
                                ))}
                            </ul>
                            
                        </>
                    )}
                  {sections.length === 0 && (
                        <h2>Select a section</h2>
                    )}
                </div>
            </div>
            <div>
      <Popup isOpen={isOpen} togglePopup={togglePopup}>
      <input
             type="text"
             value={EditTodoInput}
             onChange={handleTodoInputChange}
            />
        <input aria-label="Time" type="time" value={EditTimeInput} onChange={handleTimeInputChange} />
        <button onClick={()=>handleEditSubmit(EditTodoInput,EditTimeInput,EditSectionIndex,EditTodoIndex)}>Submit</button>

      </Popup>
    </div>
    <div>
      <Popup isOpen={isEditingSection} togglePopup={togglePopupSectionEdit}>
      <input
             type="text"
             value={EditSectionInput}
             onChange={handleSectionInputChange}
            />
        <button onClick={()=>handleEditSectionSubmit(EditSectionIndex,EditSectionInput)}>Submit</button>

      </Popup>
    </div>
    <Popup isOpen={resureIsOpen} togglePopup={toggleResurePopup}>
      <h1>Are You Sure ?</h1>
      <h3>{deleteTarget?.type==="section"?`this will delete the whole section ! `:`this will delete the todo and cant be undone`}</h3>
        <button onClick={handleDeleteConfirmation}>Submit</button>

      </Popup>
        </>
    );
};


export default TodoList;
