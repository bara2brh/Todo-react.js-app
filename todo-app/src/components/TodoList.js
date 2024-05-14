import React from 'react';

const { useState } = React;

const TodoList = () => {
    const [sections, setSections] = useState([]);
    const [sectionInput, setSectionInput] = useState('');
    const [todoInput, setTodoInput] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [selectedSection, setSelectedSection] = useState(null);
    const [toggleInput, setToggleInput] = useState(false);

    const handleSectionInputChange = (event) => {
        setSectionInput(event.target.value);
    };

    const handleToggleInput = () => {
        setToggleInput(!toggleInput);
    }

    const handleTodoInputChange = (event) => {
        setTodoInput(event.target.value);
    };

    const handleTimeInputChange = (event) => {
        setTimeInput(event.target.value);
    }

    const handleAddSection = () => {
        if (sectionInput.trim() !== '') {
            setSections([...sections, { title: sectionInput, todos: [] }]);
            setSectionInput('');
            setTimeInput('');

        }
    };

    const handleDeleteTodo = (sectionIndex, todoIndex) => {
        const updatedSections = [...sections];
        updatedSections[sectionIndex].todos.splice(todoIndex, 1);
        setSections(updatedSections);
    };

    const handleAddTodo = (sectionIndex) => {
        if (todoInput.trim() !== '' && timeInput.trim()!=='') {
            const updatedSections = [...sections];
            updatedSections[sectionIndex].todos.push({ text: todoInput, time: convertTo12HourFormat(timeInput) });
            setSections(updatedSections);
            setTodoInput('');
            setTimeInput('');
        }
    };

    const handleSectionClick = (sectionIndex) => {
        setSelectedSection(sectionIndex);
    };

    const convertTo12HourFormat = (time) => {
        const [hours, minutes] = time.split(':');
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const adjustedHours = hours % 12 || 12;
        return `${adjustedHours}:${minutes} ${suffix}`;
    };


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
                                {section.title}
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
                    {selectedSection !== null && (
                        <>
                            <h2>{sections[selectedSection].title}</h2>
                            <ul>
                                {sections[selectedSection].todos.map((todo, index) => (
                                    <li key={index}>
                                        {todo.text} - {todo.time}
                                        <button onClick={() => handleDeleteTodo(selectedSection, index)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                            <input
                                type="text"
                                value={todoInput}
                                onChange={handleTodoInputChange}
                                placeholder={`Add new todo for ${sections[selectedSection].title}`}
                            />
                            <input aria-label="Time" type="time" value={timeInput} onChange={handleTimeInputChange} />

                            <button onClick={() => handleAddTodo(selectedSection)}>Add</button>
                        </>
                    )}
                </div>
            </div>

        </>
    );
};


export default TodoList;
