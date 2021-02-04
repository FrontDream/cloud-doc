import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faEdit, faTimes, faTrash} from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import { useKeyPress, useContextMenu } from '../../hooks';
import { getParentNode } from '../../utils/helper'
import './index.css'

const FileList = ({ files, onFileClick,onFileDelete,onSaveEdit})=>{
    let node = useRef(null)
    // 输入框输入的值
    const [value, setValue] = useState('')
    // 当前正在编辑的ID
    const [editStatus, setEditStatus] =useState(false)
    // 回车键
    const enterPressed = useKeyPress(13)
    // esc取消键
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

        // 回车键、正在编辑、值不为空
        if(enterPressed && editStatus && value.trim()!==''){
            onSaveEdit(editItem.id,value,editItem.isNew)
            setValue('')
            setEditStatus(false)
        }
        // esc取消键、正在编辑
        if(escPressed && editStatus){
            closeEdit(editItem)
        }
    })

    useEffect(()=>{
        // 新建时 isNew为true,编辑这一条数据
        const newFile = files.find(file=>file.isNew)
        if(newFile){
            setEditStatus(newFile.id)
            setValue(newFile.title)
        }
    },[files])

    const closeEdit = (editItem)=>{
        // 设置为非编辑状态
        setEditStatus(false)
        // 新建时取消编辑则删除
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
                                        onClick={()=>closeEdit(file)}
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