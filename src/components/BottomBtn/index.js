import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faTrash} from "@fortawesome/free-solid-svg-icons";

const BottomBtn = ({text,colorClass, icon, onBtnClick})=>{
    return (
        <button
            type="button"
            className={`btn btn-block no-border ${colorClass}`}
            onClick={onBtnClick}
        >
            <FontAwesomeIcon
                size="lg"
                icon={icon}
                className="mr-2"
            />
            {text}
        </button>
    )
}

BottomBtn.propTypes = {
    text: PropTypes.string,
    colorClass: PropTypes.string,
    icon: PropTypes.object.isRequired,
    onBtnClick: PropTypes.func
}

BottomBtn.defaultProps = {
    text: '新建'
}

export default BottomBtn