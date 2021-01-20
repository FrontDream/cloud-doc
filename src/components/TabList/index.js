import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faEdit, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons'

import PropTypes from 'prop-types'
import { useKeyPress } from '../../hooks'
import cls from 'classnames'
import './index.scss'

const TabList = ({ files, activeId,unsaveIds,onTabClick, onCloseTab}) =>{
    return (
        <ul
            className="nav nav-pills tabList-x"
        >
            {
                files.map(file=>{
                    const withUnsasvedMark = unsaveIds.includes(file.id)
                    const fClassNames = cls({
                        'nav-link': true,
                        'active': file.id ===activeId,
                        'withUnsave': withUnsasvedMark
                    })
                    return (
                        <li
                            className="nav-item"
                            key={file.id}
                            onClick={(e)=>{
                                e.preventDefault();
                                onTabClick(file.id)
                            }}
                        >
                            <a href="#" className={fClassNames}>
                                {file.title}
                                <span
                                    className="ml-2 close-icon"
                                    onClick={e=>{
                                        e.stopPropagation()
                                        onCloseTab(file.id)
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faTimes}
                                    />
                                </span>
                                {
                                    withUnsasvedMark && <span className="rounded-circle ml-2 unsaved-icon"></span>
                                }
                            </a>
                        </li>
                    )
                })
            }
        </ul>
    )
}

TabList.propTypes = {
    files: PropTypes.array,
    activeId: PropTypes.string,
    unsaveIds: PropTypes.array,
    onTabClick: PropTypes.func,
    onCloseTab: PropTypes.func
}

TabList.defaultProps = {
    unsaveIds: []
}

export default TabList