import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch, faTimes} from '@fortawesome/fontawesome-free-solid';
import { useKeyPress } from '../../hooks'
import './index.css'


const FileSearch = ({ title, onFileSearch})=>{
    // 输入框的状况
    const [inputActive, setInputActive] = useState(false)
    // 用户输入的值
    const [value, setValue] = useState('')
    // 监听回车键是否被按下
    const enterPressed = useKeyPress(13)
    // 监听esc键是否被按下
    const esePressed = useKeyPress(27)

    let node = useRef(null)

    useEffect(()=>{
        // 输入状态下，按下回车键
        if(enterPressed && inputActive){
            onFileSearch(value)
        }
        // 在输入的状态下，按下esc键
        if(esePressed && inputActive){
            closeSearch()
        }
    })
    // 当切换搜索时，当为输入框时，焦点聚焦
    useEffect(()=>{
        if(inputActive){
            node.current.focus()
        }
    }, [inputActive])
    // 退出搜索，切换输入框，设置值为空，并将空值传递出去
    const closeSearch = ()=>{
        setInputActive(false)
        setValue('')
        onFileSearch('')
    }
    return (
        <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0">
            { !inputActive && (
                <>
                    <span>{title}</span>
                    <button
                        type="button"
                        className="icon-button"
                        onClick={()=>setInputActive(true)}
                    >
                        <FontAwesomeIcon title={'搜索'} icon ={faSearch} size={"lg"} />
                    </button>
                </>
            )}
            {
                inputActive && (
                    <>
                        <input
                            className="form-control"
                            value={value}
                            ref={node}
                            onChange={(e)=>{setValue(e.target.value)}}
                        />
                        <button
                            type="button"
                            className="icon-button"
                            onClick={closeSearch}
                        >
                            <FontAwesomeIcon title={'关闭'} icon ={faTimes} size={"lg"} />
                        </button>
                    </>
                )
            }
        </div>
    )
}

FileSearch.prototype = {
    title: PropTypes.string,
    onFileSearch: PropTypes.func.isRequired
}

FileSearch.defaultProps = {
    title: '我的云文档'
}

export default FileSearch