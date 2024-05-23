import React from "react";
import { Action, Trigger } from "../QuickFSM";

export type ActionTriggerProps = {
    actionTrigger: (Action | Trigger);
    clickable?: boolean;
    onClick?: (() => void) | undefined;
};

function ActionTrigger({ actionTrigger, clickable, onClick }: ActionTriggerProps) {

    const IconComponent = actionTrigger.icon;
    
    return (
        <button
            onClick={onClick}
            disabled={!clickable}
            style={{
                backgroundColor: actionTrigger.color,
                padding: "3px",
                fontSize: "10pt",
                lineHeight: "12px",
                height: "20px",
                fontWeight: "bold",
                border: "black 1.5px solid",
            }}
        >
            {IconComponent ? <IconComponent style={{transform: "translate(0, -1px)"}}/> : actionTrigger.label}
        </button>

    );
}

export default ActionTrigger;