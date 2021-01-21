import React, { useState, useEffect, useRef } from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch, faTimes} from '@fortawesome/fontawesome-free-solid';
import PropTypes from 'prop-types'
import { useKeyPress } from '../../hooks'
import './index.css'


const FileSearch = ({ title, onFileSearch})=>{
    const [inputActive, setInputActive] = useState(false)
    const [value, setValue] = useState('')
    const enterPressed = useKeyPress(13)
    const esePressed = useKeyPress(27)

    let node = useRef(null)

    useEffect(()=>{
        if(enterPressed && inputActive){
            onFileSearch(value)
        }
        if(esePressed && inputActive){
            closeSearch()
        }
    })
    useEffect(()=>{
        if(inputActive){
            node.current.focus()
        }
    }, [inputActive])
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