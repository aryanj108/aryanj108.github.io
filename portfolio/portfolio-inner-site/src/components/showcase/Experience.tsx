import React from 'react';
import { Link } from 'react-router-dom';
import ResumeDownload from './ResumeDownload';

export interface ExperienceProps {}

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIENCE PAGE  (Aryan Jalota)
// -----------------------------------------------------------------------------
// Each role is one <div styles.headerContainer> header block followed by a
// <div className="text-block"> with a <ul> of bullet points. To add / edit a
// role, copy one block and change the company (<h1>), link (<h4>), title (<h3>),
// location + dates, and the <li> bullets.
//
// Ordered by start date, most recent first.
// ─────────────────────────────────────────────────────────────────────────────

const Experience: React.FC<ExperienceProps> = (props) => {
    return (
        <div className="site-page-content">
            <ResumeDownload />

            {/* ── Salesforce ─────────────────────────────────────────────── */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Salesforce</h1>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href={'https://www.salesforce.com/'}
                        >
                            <h4>www.salesforce.com</h4>
                        </a>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Applied AI Software Engineer Intern</h3>
                        <b>
                            <p>May 2026 - Aug 2026</p>
                        </b>
                    </div>
                    <div style={styles.headerRow}>
                        <p>
                            <i>Office of the CEO &middot; San Francisco, CA</i>
                        </p>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <ul>
                    <li>
                        <p>
                            Architected and shipped a distributed production
                            platform for Marc Benioff and Salesforce&rsquo;s
                            executive leadership team; built a shared
                            Node.js/TypeScript backend with 40+ REST APIs and
                            an MCP tool server supporting enterprise workflows.
                        </p>
                    </li>
                    <li>
                        <p>
                            Built the agent on Headless360 to operate across
                            Slack, Google Workspace, and Zoom/Google Meet with
                            direct access to sensitive organizational data,
                            tuning it specifically to the CEO&rsquo;s workflows
                            to help him run the company with faster, more
                            accurate information.
                        </p>
                    </li>
                    <li>
                        <p>
                            Worked across engineering and cross-functional
                            stakeholder teams to gather requirements, evaluate
                            technical tradeoffs, and iterate on production
                            workflows.
                        </p>
                    </li>
                    <li>
                        <p>
                            Improved AI query accuracy from 21% to 95% and
                            reduced p50 latency 5&times; through deterministic
                            entity resolution, LLM routing, and multi-layer
                            caching across live enterprise data.
                        </p>
                    </li>
                    <li>
                        <p>
                            Reduced executive briefing preparation time 92%,
                            from 2 hours to 10 minutes, by building production
                            retrieval and automation workflows across
                            enterprise systems.
                        </p>
                    </li>
                    <li>
                        <p>
                            Collaborated closely with senior Salesforce
                            executives, including the SVP and Chief of Staff to
                            the CEO, culminating in a final in-person
                            presentation of the project to Marc Benioff and
                            15+ members of his executive leadership team.
                        </p>
                    </li>
                    <li>
                        <p>
                            Improved deployment reliability and scalability by
                            migrating a production backend from SQLite to
                            PostgreSQL across 20+ tables and implementing
                            OAuth 2.0/Google SSO.
                        </p>
                    </li>
                    <li>
                        <p>
                            Traveled on behalf of Salesforce to World Tour and
                            customer conferences in Chicago, London, and
                            Hawaii, speaking with 30+ customers and partners
                            &mdash; including Bobbi, TIME Magazine, the Texas
                            Department of Public Safety, Ring, Southwest
                            Airlines, F1, Fin, Qualified, Sierra, and more
                            &mdash; on how the Salesforce narrative and product
                            delivery should evolve alongside AI, and reporting
                            findings back to Salesforce leadership.
                        </p>
                    </li>
                    <li>
                        <p>
                            Engineered facial-recognition speaker verification using ArcFace
                            embeddings, liveness detection, and AES-256-GCM encrypted storage,
                            restricting meeting-bot responses to verified executive users.
                        </p>
                    </li>
                </ul>
            </div>

            {/* ── Texas Convergent (Forge) — Longhorn Life Sciences ───────── */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Texas Convergent</h1>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href={'https://txconvergent.org/forge'}
                        >
                            <h4>txconvergent.org/forge</h4>
                        </a>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Forge Team Member &middot; Longhorn Life Sciences</h3>
                        <b>
                            <p>Jan 2026 - May 2026</p>
                        </b>
                    </div>
                    <div style={styles.headerRow}>
                        <p>
                            <i>Forge Program &middot; Austin, TX</i>
                        </p>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <ul>
                    <li>
                        <p>
                            Built a cross-platform Expo/React Native app for
                            startup Longhorn Life Sciences' iDetect wound
                            monitoring system, working with a cross-functional
                            team to take the product from hardware prototype to
                            a usable clinical tool.
                        </p>
                    </li>
                    <li>
                        <p>
                            Implemented BLE central connectivity (
                            react-native-ble-plx, Nordic UART Service) to a
                            Raspberry Pi-hosted Vector Network Analyzer,
                            including chunked base64 payload reassembly,
                            end-of-message parsing, and a heartbeat-based
                            reconnect handler to recover from silent peripheral
                            disconnects.
                        </p>
                    </li>
                    <li>
                        <p>
                            Built Firebase-backed (Auth, Firestore, Storage)
                            patient and nurse workflows spanning wound image
                            capture, clinical document uploads, and
                            infection-risk dashboards with role-based access.
                        </p>
                    </li>
                    <li>
                        <p>
                            Iterated on UI/UX directly with clinicians across
                            multiple review cycles to refine the Bluetooth,
                            dashboard, and clinical documentation screens for
                            real-world clinical use.
                        </p>
                    </li>
                </ul>
            </div>

            {/* ── Hook Em' Hacks ───────────────────────────────────────────── */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>Hook Em' Hacks</h1>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href={'https://www.hookemhacks.com/2025.html'}
                        >
                            <h4>www.hookemhacks.com</h4>
                        </a>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Technology &amp; Logistics Team Lead</h3>
                        <b>
                            <p>Nov 2025 - May 2026</p>
                        </b>
                    </div>
                    <div style={styles.headerRow}>
                        <p>
                            <i>Austin, TX</i>
                        </p>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <ul>
                    <li>
                        <p>
                            Led full-stack development and architecture of a
                            production-ready hackathon website supporting 250+
                            participants, defining feature priorities and
                            implementing scalable backend services.
                        </p>
                    </li>
                    <li>
                        <p>
                            Directed end-to-end event logistics, team
                            assignments, and industry outreach, securing key
                            sponsors and ensuring successful delivery of
                            technology-driven solutions.
                        </p>
                    </li>
                </ul>
            </div>

            {/* ── UT Austin — Geospatial ML Research ─────────────────────── */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>UT Austin</h1>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href={'https://sites.utexas.edu/gisense/'}
                        >
                            <h4>www.utexas.edu/gisense</h4>
                        </a>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Undergraduate Research SWE &middot; Geospatial ML</h3>
                        <b>
                            <p>Aug 2025 - May 2026</p>
                        </b>
                    </div>
                    <div style={styles.headerRow}>
                        <p>
                            <i>The University of Texas at Austin &middot; Austin, TX</i>
                        </p>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <ul>
                    <li>
                        <p>
                            Designed a distributed data pipeline using parallel
                            and asynchronous processing to transform geospatial
                            datasets into optimized HDF5 feature stores,
                            improving ML training throughput by 45%.
                        </p>
                    </li>
                    <li>
                        <p>
                            Built modular end-to-end ML pipelines in Python
                            using PyTorch and NumPy, with PyTest, CI workflows,
                            and automated data validation, improving reliability
                            and reproducibility across data-intensive research
                            systems.
                        </p>
                    </li>
                </ul>
            </div>

            {/* ── DTCC ───────────────────────────────────────────────────── */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>DTCC</h1>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href={'https://www.dtcc.com/'}
                        >
                            <h4>www.dtcc.com</h4>
                        </a>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>Software Engineering Intern</h3>
                        <b>
                            <p>June 2025 - Aug 2025</p>
                        </b>
                    </div>
                    <div style={styles.headerRow}>
                        <p>
                            <i>
                                Depository Trust &amp; Clearing Corporation
                                &middot; Coppell, TX
                            </i>
                        </p>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <ul>
                    <li>
                        <p>
                            Engineered scalable Python pipelines to extract and
                            validate multi-page audit reports, processing 1,000+
                            pages/hour with structured logging, fault tolerance,
                            and automated validation.
                        </p>
                    </li>
                    <li>
                        <p>
                            Reduced manual workload by 10&ndash;15 hours/week by
                            replacing a manual review process with automated
                            extraction and validation.
                        </p>
                    </li>
                    <li>
                        <p>
                            Built a Tkinter-based desktop tool that lets users
                            click-and-drag to "snip" table or text regions from
                            a rendered PDF, then auto-detects and extracts
                            matching regions across every page using header
                            fingerprinting and fuzzy matching, with reusable
                            JSON templates and one-click Excel export. (See the{' '}
                            <Link to="/projects/software">
                                PDF Data Extraction Toolkit
                            </Link>{' '}
                            on the Projects page.)
                        </p>
                    </li>
                </ul>
            </div>

            {/* ── UT Austin — Computer Vision Research ───────────────────── */}
            <div style={styles.headerContainer}>
                <div style={styles.header}>
                    <div style={styles.headerRow}>
                        <h1>UT Austin</h1>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href={'https://www.utexas.edu/'}
                        >
                            <h4>www.utexas.edu</h4>
                        </a>
                    </div>
                    <div style={styles.headerRow}>
                        <h3>
                            Undergraduate Research SWE &middot; Computer Vision
                        </h3>
                        <b>
                            <p>Aug 2024 - May 2026</p>
                        </b>
                    </div>
                    <div style={styles.headerRow}>
                        <p>
                            <i>The University of Texas at Austin &middot; Austin, TX</i>
                        </p>
                    </div>
                </div>
            </div>
            <div className="text-block">
                <ul>
                    <li>
                        <p>
                            Designed and optimized real-time computer vision
                            systems using PyTorch, YOLOv8, and OpenCV, leveraging
                            GPU-accelerated training and inference for
                            low-latency vehicle detection.
                        </p>
                    </li>
                    <li>
                        <p>
                            Validated deep learning models through systematic
                            training and validation workflows, achieving 0.85+
                            mAP with high-80s precision/recall for
                            deployment-oriented traffic analysis.
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    header: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
    },
    skillRow: {
        flex: 1,
        justifyContent: 'space-between',
    },
    skillName: {
        minWidth: 56,
    },
    skill: {
        flex: 1,
        padding: 8,
        alignItems: 'center',
    },
    progressBar: {
        flex: 1,
        background: 'red',
        marginLeft: 8,
        height: 8,
    },
    hoverLogo: {
        height: 32,
        marginBottom: 16,
    },
    headerContainer: {
        alignItems: 'flex-end',
        width: '100%',
        justifyContent: 'center',
    },
    hoverText: {
        marginBottom: 8,
    },
    indent: {
        marginLeft: 24,
    },
    headerRow: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
    },
};

export default Experience;