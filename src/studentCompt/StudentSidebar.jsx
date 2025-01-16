import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomColorPicker, { isLightColor } from '../pages/colorpicker/CustomColorPicker';

const StudentSidebar = () => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [sidebarColor, setSidebarColor] = useState(localStorage.getItem('studentSidebarColor') || '#0a9400');

    const handleColorChange = (color) => {
        setSidebarColor(color);
        localStorage.setItem('studentSidebarColor', color);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log(file);
        }
    };

    const textColorClass = isLightColor(sidebarColor) ? 'text-dark' : 'text-light';

    return (
        <>
            <div className={`sidebar px-3 py-3 me-0 ${textColorClass}`} style={{ background: sidebarColor }}>
                <div className="d-flex flex-column h-100">
                    <div className="mb-0 brand-icon mt-5">
                        <img src='../Images/IndiaEducatesLogo1.png' style={{ height: "4.5rem", marginLeft:"-1.2rem" }} alt="Logo" />
                    </div>
                    
                    <ul className="menu-list flex-grow-1 mt-3">
                        <li>
                            <Link className="ms-link" to="/student-dashboard">
                                <i className="icofont-home fs-5" /> <span className='fs-6'>Student Dashboard</span>
                            </Link>
                        </li>

                        <li className="collapsed">
                            <a className="m-link" data-bs-toggle="collapse" data-bs-target="#course-Components" href="#">
                                <i className="icofont-book" />
                                <span>Forms</span>
                                <span className="arrow icofont-dotted-down ms-auto text-end fs-5" />
                            </a>
                            <ul className="sub-menu collapse" id="course-Components">
                                <li>
                                    <Link className="ms-link" to="/student-forms">
                                        <span>Fill Forms</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="ms-link" to="/yours-forms">
                                        <span>Your's Forms</span>
                                    </Link>
                                </li>
                                {/* <li>
                                    <Link className="ms-link" to="/student-assignments">
                                        <span>Assignments</span>
                                    </Link>
                                </li> */}
                            </ul>
                        </li>

                        <li className="collapsed">
                            <a className="m-link" data-bs-toggle="collapse" data-bs-target="#tools-Components" href="#">
                                <i className="icofont-tools-alt-2" />
                                <span>Tools</span>
                                <span className="arrow icofont-dotted-down ms-auto text-end fs-5" />
                            </a>
                            <ul className="sub-menu collapse" id="tools-Components">
                                <li>
                                    <Link className="ms-link" to="/student-resources">
                                        <span>Learning Resources</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="ms-link" to="/student-calendar">
                                        <span>Calendar</span>
                                    </Link>
                                </li>
                            </ul>
                        </li>
                    </ul>

                    <div className="d-flex justify-content-end mb-2">
                        <button
                            className='border-0 bg-transparent'
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            title="Customize Sidebar Color"
                        >
                            <i className={`bi bi-palette-fill ${textColorClass}`}></i>
                        </button>
                        {showColorPicker && (
                            <div className='position-absolute' style={{ top: '25rem', right: '67rem' }}>
                                <CustomColorPicker
                                    color={sidebarColor}
                                    onChange={handleColorChange}
                                    onClose={() => setShowColorPicker(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default StudentSidebar; 