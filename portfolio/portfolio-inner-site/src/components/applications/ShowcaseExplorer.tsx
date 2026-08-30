import React, { useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate,
} from 'react-router-dom';
import Home from '../showcase/Home';
import About from '../showcase/About';
import Window from '../os/Window';
import Education from '../showcase/Education';
import Experience from '../showcase/Experience';
import Projects from '../showcase/Projects';
import Contact from '../showcase/Contact';
import SoftwareProjects from '../showcase/projects/Software';
// Music & Art project pages removed (Henry-specific hobbies). To re-add your own,
// create the component under showcase/projects/ and register a <Route> below.
import VerticalNavbar from '../showcase/VerticalNavbar';
import useInitialWindowSize from '../../hooks/useInitialWindowSize';
import { consumePendingRoute, onShowcaseRoute } from '../../utils/appBus';

export interface ShowcaseExplorerProps extends WindowAppProps {}

/**
 * Lets other desktop apps (the Contact shortcut) drive this window's route.
 * Must live inside <Router> to reach useNavigate. On mount it consumes any
 * route requested while this window was closed, then listens for later ones.
 */
const RouteBridge: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const pending = consumePendingRoute();
        if (pending) navigate(pending);
        return onShowcaseRoute((path) => navigate(path));
    }, [navigate]);

    return null;
};

const ShowcaseExplorer: React.FC<ShowcaseExplorerProps> = (props) => {
    const { initWidth, initHeight } = useInitialWindowSize({ margin: 100 });

    return (
        <Window
            top={24}
            left={56}
            width={initWidth}
            height={initHeight}
            windowTitle="Aryan Jalota - Showcase 2026"
            windowBarIcon="windowExplorerIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText={'© Copyright 2026 Aryan Jalota'}
        >
            {/* basename keeps routing correct when served from a subpath
                (PUBLIC_URL is '/os' in the build, '' in dev). Without it the
                landing route never matches and the page renders empty. */}
            <Router basename={process.env.PUBLIC_URL}>
                <RouteBridge />
                <div className="site-page">
                    <VerticalNavbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/education" element={<Education />} />
                        <Route path="/experience" element={<Experience />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route
                            path="/projects/software"
                            element={<SoftwareProjects />}
                        />
                    </Routes>
                </div>
            </Router>
        </Window>
    );
};

export default ShowcaseExplorer;
