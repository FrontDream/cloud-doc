import React, { useState, useEffect, useRef } from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch, faTimes} from '@fortawesome/fontawesome-free-solid';
import './index.css'


const FileSearch = ({ title, onFileSearch})=>{
    const [inputActive, setInputActive] = useState(false)
    const [value, setValue] = useState('')

    let node = useRef(null)

    useEffect(()=>{
        const handleInputEvent = (event)=>{
            const { keyCode } = event
            if(keyCode ===13 && inputActive){
                onFileSearch(value)
            }else if(keyCode === 27 && inputActive){
                closeSearch(event)
            }
        }
        document.addEventListener('keyup', handleInputEvent)
        return ()=>{
            document.removeEventListener('keyup',handleInputEvent)
        }
    })
    useEffect(()=>{
        if(inputActive){
            node.current.focus()
        }
    }, [inputActive])
    const closeSearch = (e)=>{
        e.preventDefault();
        setInputActive(false)
        setValue('')
    }
    return (
        <div className="alert alert-primary d-flex justify-content-between align-items-center">
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

export default FileSearch