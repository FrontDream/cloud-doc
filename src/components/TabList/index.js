import React from "react";
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import cls from 'classnames'
import './index.scss'

const TabList = ({ files, activeId,unSaveIds,onTabClick, onCloseTab }) =>{
    return (
        <ul
            className="nav nav-pills tabList-x"
        >
            {
                files.map(file=>{
                    const withUnSavedMark = unSaveIds.includes(file.id)
                    const fClassNames = cls({
                        'nav-link': true,
                        'active': file.id ===activeId,
                        // 存在修改未保存的文件则展示红色，当悬浮时，红色消失，变成x
                        'withUnsave': withUnSavedMark
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
                                    withUnSavedMark && <span className="rounded-circle ml-2 unsaved-icon"></span>
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
    unSaveIds: PropTypes.array,
    onTabClick: PropTypes.func,
    onCloseTab: PropTypes.func
}

TabList.defaultProps = {
    unSaveIds: []
}

export default TabList