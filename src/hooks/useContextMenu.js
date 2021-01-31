import { useState, useEffect, useRef } from "react";

const { remote } = window.require('electron')

const { Menu, MenuItem } = remote

const useContextMenu = (items, selector)=>{
    const clickElement = useRef(null)
    useEffect(()=>{
        const menu = new Menu();
        items.forEach(item=>{
            menu.append(new MenuItem(item))
        })
        const handleContextMenu = (e)=>{
            if(document.querySelector(selector).contains(e.target)){
                clickElement.current = e.target
                menu.popup()
            }
        }
        window.addEventListener('contextmenu',handleContextMenu)
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu)
        }
    },[])
    return clickElement
}

export default useContextMenu