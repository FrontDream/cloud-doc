import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faEdit, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import { useKeyPress, useContextMenu } from '../../hooks';
import { getParentNode } from '../../utils/helper'
import './index.css'

const FileList = ({ files, onFileClick,onFileDelete,onSaveEdit})=>{
    let node = useRef(null)
    const [value, setValue] = useState('')
    const [editStatus, setEditStatus] =useState(false)
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)

    const clickElement = useContextMenu([
        {
            label: '打开',
            click:()=>{
                const parentNode = getParentNode(clickElement.current,'file-item')
                if(parentNode){
                    onFileClick(parentNode.dataset.id)
                }
            }
        },
        {
            label: '重命名',
            click:()=>{
                const parentNode = getParentNode(clickElement.current,'file-item')
                if(parentNode){
                    setEditStatus(parentNode.dataset.id);
                    setValue(parentNode.dataset.title)
                }
            }
        },
        {
            label: '删除',
            click:()=>{
                const parentNode = getParentNode(clickElement.current,'file-item')
                if(parentNode){
                    onFileDelete(parentNode.dataset.id)
                }
            }
        },
    ], '.file-list', [files])

    useEffect(()=>{
        const editItem = files.find(file=>file.id === editStatus)

        if(enterPressed && editStatus && value.trim()!==''){
            onSaveEdit(editItem.id,value,editItem.isNew)
            setValue('')
            setEditStatus(false)
        }
        if(escPressed && editStatus){
            closeSearch(editItem)
        }
    })

    useEffect(()=>{
        const newFile = files.find(file=>file.isNew)
        if(newFile){
            setEditStatus(newFile.id)
            setValue(newFile.title)
        }
    },[files])

    const closeSearch = (editItem)=>{
        setEditStatus(false)
        if(editItem.isNew){
            onFileDelete(editItem.id)
        }
    }
    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file=>(
                    <li
                        className="list-group-item bg-light row d-flex align-items-center file-item mx-0"
                        key={file.id}
                        data-id={file.id}
                        data-title={file.title}
                    >
                        {
                            (file.id !==editStatus && !file.isNew) && (
                                <>
                                    <span className="col-2">
                                        <FontAwesomeIcon icon={faMarkdown} size={'lg'}/>
                                    </span>
                                    <span className="col-10 c-link" onClick={()=>onFileClick(file.id)}>{file.title}</span>
                                    {/*<button*/}
                                    {/*    type="button"*/}
                                    {/*    className="icon-button col-2"*/}
                                    {/*    onClick={()=>{*/}
                                    {/*        setEditStatus(file.id);*/}
                                    {/*        setValue(file.title)*/}
                                    {/*    }}*/}
                                    {/*>*/}
                                    {/*    <FontAwesomeIcon*/}
                                    {/*        title="编辑"*/}
                                    {/*        size="lg"*/}
                                    {/*        icon={faEdit}*/}
                                    {/*    />*/}
                                    {/*</button>*/}
                                    {/*<button*/}
                                    {/*    type="button"*/}
                                    {/*    className="icon-button col-2"*/}
                                    {/*    onClick={()=>{onFileDelete(file.id)}}*/}
                                    {/*>*/}
                                    {/*    <FontAwesomeIcon*/}
                                    {/*        title="删除"*/}
                                    {/*        size="lg"*/}
                                    {/*        icon={faTrash}*/}
                                    {/*    />*/}
                                    {/*</button>*/}
                                </>
                            )
                        }
                        {
                            (file.id === editStatus || file.isNew) &&(
                                <>
                                    <input
                                        className="form-control col-10"
                                        ref={node}
                                        value={value}
                                        placeholder="请输入文件名称"
                                        onChange={(e) => { setValue(e.target.value) }}
                                    />
                                    <button
                                        type="button"
                                        className="icon-button col-2"
                                        onClick={()=>closeSearch(file)}
                                    >
                                        <FontAwesomeIcon
                                            title="关闭"
                                            size="lg"
                                            icon={faTimes}
                                        />
                                    </button>
                                </>
                            )
                        }
                    </li>
                ))
            }
        </ul>
    )
}

FileList.propTypes = {
    files: PropTypes.array,
    onFileClick: PropTypes.func,
    onFileDelete: PropTypes.func,
    onSaveEdit: PropTypes.func
}
export default  FileList