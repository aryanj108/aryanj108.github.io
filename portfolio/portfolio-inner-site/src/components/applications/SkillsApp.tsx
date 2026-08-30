import React from 'react';
import Window from '../os/Window';
import SkillsView from '../skills/SkillsView';

export interface SkillsAppProps extends WindowAppProps {}

const SkillsApp: React.FC<SkillsAppProps> = (props) => {
    return (
        <Window
            top={40}
            left={140}
            width={720}
            height={700}
            windowTitle="Skills"
            windowBarIcon="windowSkillsIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText={'© Copyright 2026 Aryan Jalota'}
        >
            <div className="site-page">
                <SkillsView />
            </div>
        </Window>
    );
};

export default SkillsApp;
