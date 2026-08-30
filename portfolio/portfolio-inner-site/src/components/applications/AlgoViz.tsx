import React, { useState } from 'react';
import AlgoVizApp from '../algoviz/AlgoVizApp';
import Window from '../os/Window';

export interface AlgoVizAppProps extends WindowAppProps {}

const AlgoViz: React.FC<AlgoVizAppProps> = (props) => {
    // Window reports its content box back through these, which is how the
    // canvases stay sized correctly when the window is resized or maximized.
    const [width, setWidth] = useState(1000);
    const [height, setHeight] = useState(720);

    return (
        <Window
            top={20}
            left={60}
            width={width}
            height={height}
            windowTitle="AlgoViz"
            windowBarIcon="windowAlgovizIcon"
            windowBarColor="#123a5c"
            bottomLeftText={'© Copyright 2026 Aryan Jalota'}
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            onWidthChange={setWidth}
            onHeightChange={setHeight}
            minimizeWindow={props.onMinimize}
        >
            <AlgoVizApp width={width} height={height} onClose={props.onClose} />
        </Window>
    );
};

export default AlgoViz;
