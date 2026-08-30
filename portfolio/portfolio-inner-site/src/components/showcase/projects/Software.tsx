import React from 'react';
import ResumeDownload from '../ResumeDownload';

export interface SoftwareProjectsProps {}

// ─────────────────────────────────────────────────────────────────────────────
// SOFTWARE PROJECTS
// -----------------------------------------------------------------------------
// Each project is a text-block div with an h2 title, an italic tech-stack line,
// a summary paragraph, and a bulleted list of specifics.
//
// Per-project "Links:" sections are currently commented out until real repo and
// demo URLs exist. To restore one, uncomment its block — and uncomment the
// GITHUB constant below if you still want the profile fallback.
//
// To add a screenshot, drop it in src/assets/pictures/projects/software/ and
// render it inside a captioned-image div.
// ─────────────────────────────────────────────────────────────────────────────

// Project links are commented out for now; restore this alongside them.
// const GITHUB = 'https://github.com/aryanj108';

const SoftwareProjects: React.FC<SoftwareProjectsProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1>Software</h1>
            <h3>Projects</h3>
            <br />
            <p>
                Below are some of my favorite software projects I've worked on —
                spanning distributed systems, high-performance C++, and applied
                machine learning infrastructure.
            </p>
            <br />
            <ResumeDownload />
            <br />

            {/* ── Interactive 3D Portfolio (this site) ────────────────────── */}
            <div className="text-block">
                <h2>Interactive 3D Portfolio</h2>
                <br />
                <p>
                    <i>
                        TypeScript &middot; Three.js &middot; WebGL &middot; GLSL
                        &middot; React &middot; Webpack 5 &middot; Web Audio API
                        &middot; GitHub Actions
                    </i>
                </p>
                <br />
                <p>
                    The site you are currently using. A real-time WebGL office
                    scene you can navigate freely, with a fully functional
                    Windows 95-style desktop running live inside the CRT
                    monitor — not a video or a texture, but an actual web app
                    composited into 3D space.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Rendered the in-scene monitor with Three.js
                            CSS3DRenderer, compositing a live iframe into the
                            WebGL scene and occluding it correctly with a
                            NoBlending GL plane so 3D geometry can pass in
                            front of the screen.
                        </p>
                    </li>
                    <li>
                        <p>
                            Bridged pointer and keyboard events across the
                            iframe boundary via postMessage, remapping
                            coordinates through the screen's transform so the
                            camera reacts to input that originates inside the
                            embedded desktop.
                        </p>
                    </li>
                    <li>
                        <p>
                            Built a positional Web Audio layer — mechanical
                            keyboard and mouse samples, ambient office tone,
                            and a switchable music player — with distance
                            attenuation and lowpass filtering driven by camera
                            position.
                        </p>
                    </li>
                    <li>
                        <p>
                            Optimized delivery of a large asset set using
                            Draco-compressed GLB geometry, compressed texture
                            layers, and lazy-loaded audio, keeping heavy media
                            off the critical path.
                        </p>
                    </li>
                    <li>
                        <p>
                            Wrote the desktop environment as a separate React
                            and TypeScript single-page app implementing
                            draggable and resizable windows, a taskbar with
                            z-order management, and a router-driven showcase,
                            plus emulated DOS titles through js-dos.
                        </p>
                    </li>
                    <li>
                        <p>
                            Automated deployment with GitHub Actions, building
                            both applications and composing them into a single
                            static site published to GitHub Pages on every
                            push to main.
                        </p>
                    </li>
                </ul>
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://aryanj108.github.io/os/"
                        >
                            <p>
                                [Live Site] - The desktop also runs on its own
                                as a standalone website, outside the 3D scene
                            </p>
                        </a>
                    </li>
                </ul>
            </div>

            {/* ── Distributed Lakehouse Analytics Platform ───────────────── */}
            <div className="text-block">
                <h2>Distributed Lakehouse Analytics Platform</h2>
                <br />
                <p>
                        <i>
                            Python &middot; Apache Spark &middot; Delta Lake
                            &middot; FastAPI &middot; Redis
                        </i>
                </p>
                <br />
                <p>
                    A distributed lakehouse built on Apache Spark and Delta Lake
                    supporting ACID transactions and SQL analytics across{' '}
                    500M+ records. I designed the storage and query
                    layers so that large-scale analytical workloads stay
                    consistent and fast even under concurrent reads and writes.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Architected a distributed lakehouse on Apache Spark
                            and Delta Lake supporting ACID transactions and SQL
                            analytics across 500M+ records.
                        </p>
                    </li>
                    <li>
                        <p>
                            Reduced repeated-query latency 60% with a FastAPI
                            query service using Redis caching and async job
                            scheduling.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a rel="noreferrer" target="_blank" href={GITHUB}>
                            <p>
                                <b>[GitHub]</b> - Distributed Lakehouse
                                Analytics Platform
                            </p>
                        </a>
                    </li>
                </ul>
                */}
            </div>

            {/* ── Distributed Search Engine ──────────────────────────────── */}
            <div className="text-block">
                <h2>Distributed Search Engine</h2>
                <br />
                <p>
                        <i>
                            C++ &middot; Go &middot; gRPC &middot; Redis &middot;
                            RocksDB &middot; Docker
                        </i>
                </p>
                <br />
                <p>
                    A sharded, distributed search engine indexing{' '}
                    10M+ documents with inverted indexes and BM25 ranking
                    at sub-100&nbsp;ms query latency. The system spreads work
                    across shards using consistent hashing and a multithreaded
                    indexing pipeline.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Built a distributed search engine indexing 10M+
                            documents with inverted indexes and BM25 ranking at
                            sub-100&nbsp;ms query latency across shards.
                        </p>
                    </li>
                    <li>
                        <p>
                            Designed a distributed gRPC query engine with
                            consistent hashing and Redis caching, reducing query
                            latency 65%; parallelized RocksDB indexing with a
                            multithreaded C++ pipeline to achieve 4&times; higher
                            throughput.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a rel="noreferrer" target="_blank" href={GITHUB}>
                            <p>
                                <b>[GitHub]</b> - Distributed Search Engine
                            </p>
                        </a>
                    </li>
                </ul>
                */}
            </div>

            {/* ── High-Performance Trading Engine ────────────────────────── */}
            <div className="text-block">
                <h2>High-Performance Trading Engine</h2>
                <br />
                <p>
                        <i>
                            C++17 &middot; Multithreading &middot; Linux &middot;
                            CMake &middot; Google Benchmark
                        </i>
                </p>
                <br />
                <p>
                    A low-latency limit order book engineered in modern C++17,
                    processing 1M+ market events/sec. I focused on
                    cache-efficient data structures and custom memory management
                    to keep the hot path fast, and validated everything with
                    Google Benchmark.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Engineered a high-performance C++17 limit order book
                            processing 1M+ market events/sec using cache-efficient
                            data structures and custom memory management,
                            validated through Google Benchmark.
                        </p>
                    </li>
                    <li>
                        <p>
                            Parallelized order processing with std::thread and
                            producer&ndash;consumer queues for 3&times;
                            throughput.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a rel="noreferrer" target="_blank" href={GITHUB}>
                            <p>
                                <b>[GitHub]</b> - High-Performance Trading Engine
                            </p>
                        </a>
                    </li>
                </ul>
                */}
            </div>

            {/* ── Longhorn Life Sciences — iDetect (BLE Wound Monitoring App) ── */}
            <div className="text-block">
                <h2>Longhorn Life Sciences — iDetect</h2>
                <br />
                <p>
                        <i>
                            Expo &middot; React Native &middot; TypeScript
                            &middot; Firebase &middot; BLE (react-native-ble-plx)
                        </i>
                </p>
                <br />
                <p>
                    A cross-platform mobile app built for startup Longhorn Life
                    Sciences as part of the Texas Convergent Forge program. The
                    app connects to a Raspberry Pi-hosted Vector Network
                    Analyzer over Bluetooth Low Energy to stream live wound
                    infection risk readings, alongside Firebase-backed patient
                    and nurse workflows for wound image capture, clinical
                    document uploads, and infection-risk dashboards.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Implemented BLE central logic over the Nordic UART
                            Service to scan, connect, and subscribe to a Pi
                            peripheral, reassembling chunked base64 payloads
                            terminated by an end-of-message marker into live
                            return-loss-vs-frequency chart data.
                        </p>
                    </li>
                    <li>
                        <p>
                            Added a heartbeat-based reconnection handler to
                            catch silent BLE disconnects that the standard
                            disconnect event misses on both Android and iOS.
                        </p>
                    </li>
                    <li>
                        <p>
                            Built role-based (nurse/patient) Firebase Auth,
                            Firestore, and Storage flows for wound images,
                            clinical documents, and nurse notes, and worked
                            directly with clinicians to iterate on the UI/UX.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <p>Private startup repository — happy to walk through it live.</p>
                    </li>
                </ul>
                */}
            </div>

            {/* ── LLM Analytics Agent ─────────────────────────────────────── */}
            <div className="text-block">
                <h2>LLM Analytics Agent</h2>
                <br />
                <p>
                        <i>
                            Python &middot; FastAPI &middot; PostgreSQL
                            &middot; LangChain &middot; OpenAI API &middot;
                            Redis &middot; AWS
                        </i>
                </p>
                <br />
                <p>
                    A full-stack analytics microservice that translates natural
                    language into complex SQL — joins, aggregations, and
                    subqueries — across relational schemas using schema-aware
                    retrieval (RAG).
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Designed schema-aware RAG retrieval for natural
                            language-to-SQL generation, improving query
                            efficiency by 70%.
                        </p>
                    </li>
                    <li>
                        <p>
                            Built, deployed, and maintained cloud-native REST
                            APIs with FastAPI using async execution, Redis
                            caching, structured logging, and robust error
                            handling for scalable, low-latency backend
                            services.
                        </p>
                    </li>
                    <li>
                        <p>
                            Designed and optimized PostgreSQL schemas with
                            migrations, indexing, and query tuning, and
                            integrated the backend with reusable React
                            dashboard components for data visualization.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a rel="noreferrer" target="_blank" href={GITHUB}>
                            <p>
                                <b>[GitHub]</b> - Aryan's profile
                            </p>
                        </a>
                    </li>
                </ul>
                */}
            </div>

            {/* ── Longhorn Living (Housing Mobile App) ───────────────────── */}
            <div className="text-block">
                <h2>Longhorn Living</h2>
                <br />
                <p>
                        <i>
                            React Native (TypeScript) &middot; Expo &middot;
                            Firebase (Auth/Firestore) &middot; React Native
                            Maps &middot; LocationIQ
                        </i>
                </p>
                <br />
                <p>
                    An end-to-end, personalized housing-discovery app for UT
                    Austin students — a swipe-based alternative to generic
                    listing sites that scores every apartment against a user's
                    budget, campus proximity, and lifestyle preferences across
                    500+ listings and 70+ apartments.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Built a 0&ndash;100% match-scoring algorithm
                            weighing price range, bed/bath count, amenities,
                            and Haversine-based distance from a reference
                            location, surfaced on swipe cards, detail screens,
                            and six scored home-screen carousels.
                        </p>
                    </li>
                    <li>
                        <p>
                            Implemented Tinder-style swipe cards and
                            draggable bottom-sheet filter/search modals using
                            React Native's raw <code>PanResponder</code> API —
                            no third-party gesture library — keeping gesture
                            state in refs so drag frames don't trigger
                            re-renders.
                        </p>
                    </li>
                    <li>
                        <p>
                            Designed a 4-state auth/onboarding router
                            (signed out &middot; unverified &middot;
                            onboarding &middot; main app) backed by Firebase
                            Auth and a real-time Firestore{' '}
                            <code>onSnapshot</code> listener for preferences
                            and saved listings, with a service layer so no
                            component talks to Firestore directly.
                        </p>
                    </li>
                    <li>
                        <p>
                            Integrated LocationIQ geocoding (debounced,
                            bounded to Austin) and a map view with custom SVG
                            pin markers optimized via{' '}
                            <code>React.memo</code> and a delayed{' '}
                            <code>tracksViewChanges</code> flag to eliminate
                            re-render jank on map updates.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aryanj108/apartmentApp"
                        >
                            <p>
                                <b>[GitHub]</b> - Longhorn Living
                            </p>
                        </a>
                    </li>
                </ul>
                */}
            </div>

            {/* ── Hook Em' Hacks Website ──────────────────────────────────── */}
            <div className="text-block">
                <h2>Hook Em' Hacks Website</h2>
                <br />
                <p>
                        <i>
                            Vanilla JavaScript &middot; HTML/CSS &middot;
                            Vercel
                        </i>
                </p>
                <br />
                <p>
                    The official website for Hook Em' Hacks, a UT Austin
                    hackathon supporting 250+ participants. I owned this
                    project end-to-end — design, front-to-back development,
                    and, as Technology &amp; Logistics Team Lead, the
                    sponsorship organization and event logistics behind it.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Built a hand-rolled, dependency-free front end
                            (no framework) with a custom animated ocean-themed
                            navbar/scrollbar, a data-driven event schedule
                            grid, and a sponsor showcase, deployed on Vercel.
                        </p>
                    </li>
                    <li>
                        <p>
                            Rendered the team roster, schedule, and sponsor
                            sections from structured JS data objects rather
                            than hardcoded markup, so each section updates
                            from one source of truth every event cycle.
                        </p>
                    </li>
                    <li>
                        <p>
                            Led sponsorship outreach and event logistics
                            alongside the technical build as Tech Team lead,
                            coordinating timelines across design, engineering,
                            and operations for 250+ participants.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://www.hookemhacks.com/2025.html"
                        >
                            <p>
                                <b>[Live Site]</b> - hookemhacks.com
                            </p>
                        </a>
                    </li>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aryanj108/hookEmHacksWebsite_2/tree/main"
                        >
                            <p>
                                <b>[GitHub]</b> - Hook Em' Hacks Website
                            </p>
                        </a>
                    </li>
                </ul>
                */}
            </div>

            {/* ── AI Parking Monitoring Lab ───────────────────────────────── */}
            <div className="text-block">
                <h2>AI Parking Monitoring Lab</h2>
                <br />
                <p>
                        <i>
                            Python &middot; Flask &middot; Ultralytics YOLO
                            &middot; OpenCV &middot; PyTorch &middot; Pandas
                        </i>
                </p>
                <br />
                <p>
                    An end-to-end, browser-accessible parking monitoring
                    system that turns a live camera feed into real-time
                    parking-space availability, grown out of my YOLOv8/OpenCV
                    research work at UT Austin.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Built a real-time vehicle/space detection pipeline
                            with Ultralytics YOLO and OpenCV, served through a
                            Flask web app for live monitoring in the browser.
                        </p>
                    </li>
                    <li>
                        <p>
                            Added a notification system that flags newly
                            available spots and an API layer for integrating
                            parking data into third-party services.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aryanj108/aiParkingMonitoringLab"
                        >
                            <p>
                                <b>[GitHub]</b> - AI Parking Monitoring Lab
                            </p>
                        </a>
                    </li>
                </ul>
                */}
            </div>

            {/* ── ASL Translator ──────────────────────────────────────────── */}
            <div className="text-block">
                <h2>ASL Translator</h2>
                <br />
                <p>
                        <i>
                            Python &middot; OpenCV &middot; MediaPipe &middot;
                            scikit-learn &middot; Streamlit
                        </i>
                </p>
                <br />
                <p>
                    An end-to-end American Sign Language translator that
                    reads a live webcam feed and converts fingerspelled
                    letters into text in real time.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Built a MediaPipe Hands-based data collector that
                            captures and normalizes 3D hand-landmark
                            coordinates for each letter of the alphabet into a
                            labeled training set.
                        </p>
                    </li>
                    <li>
                        <p>
                            Trained a scikit-learn Random Forest classifier on
                            the landmark features to recognize letters, then
                            built a real-time interpreter that debounces
                            predictions with a per-letter cooldown to assemble
                            full sentences from live video.
                        </p>
                    </li>
                    <li>
                        <p>
                            Shipped a Streamlit + streamlit-webrtc web demo so
                            the interpreter runs directly in the browser off
                            the user's webcam, no local setup required.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aryanj108/aslTranslator"
                        >
                            <p>
                                <b>[GitHub]</b> - ASL Translator
                            </p>
                        </a>
                    </li>
                </ul>
                */}
            </div>

            {/* ── Full-Stack Notes Sharing Platform ───────────────────────── */}
            <div className="text-block">
                <h2>Notes Sharing Platform</h2>
                <br />
                <p>
                        <i>Spring Boot &middot; React.js &middot; AWS S3</i>
                </p>
                <br />
                <p>
                    A full-stack web application for uploading, storing, and
                    collaboratively sharing notes and documents.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Developed a full-stack app using Spring Boot and
                            React.js with RESTful APIs and Git-based version
                            control workflows to enable scalable document
                            upload, storage, and collaborative development.
                        </p>
                    </li>
                    <li>
                        <p>
                            Integrated AWS S3 cloud storage and implemented
                            automated backend testing (JUnit) to ensure
                            reliability across distributed file storage
                            systems.
                        </p>
                    </li>
                    <li>
                        <p>
                            Built a responsive React frontend with
                            component-based architecture and modular state
                            design, improving UI scalability and
                            maintainability.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a rel="noreferrer" target="_blank" href={GITHUB}>
                            <p>
                                <b>[GitHub]</b> - Aryan's profile
                            </p>
                        </a>
                    </li>
                </ul>
                */}
            </div>
 
            {/* ── PDF Data Extraction Toolkit (built at DTCC) ─────────────── */}
            <div className="text-block">
                <h2>PDF Data Extraction Toolkit</h2>
                <br />
                <p>
                        <i>
                            Python &middot; Tkinter &middot; Streamlit &middot;
                            PyMuPDF &middot; pdfplumber &middot; pandas &middot;
                            openpyxl
                        </i>
                </p>
                <br />
                <p>
                    Built during my internship at DTCC, this is a family of
                    tools that all solve the same problem — pulling structured
                    data out of unstructured PDFs — at increasing levels of
                    sophistication: a CLI batch processor, a Streamlit web app,
                    and finally a full visual desktop GUI.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Desktop GUI (Tkinter): click-and-drag to
                            "snip" table or free-text regions on a rendered PDF
                            (via PyMuPDF), then auto-detect and extract every
                            matching region across the document using header
                            fingerprinting and fuzzy matching (difflib).
                            Snip layouts save as reusable, named JSON templates,
                            with smart title detection via font/position
                            clustering and automatic repair of table cells that
                            wrapped across lines.
                        </p>
                    </li>
                    <li>
                        <p>
                            Streamlit &amp; CLI batch versions: a
                            browser-based multi-PDF upload tool and a
                            folder-based batch processor, sharing the same
                            dual-strategy pdfplumber extraction and fuzzy
                            header-matching engine, both exporting cleaned
                            results to Excel via pandas/openpyxl.
                        </p>
                    </li>
                    <li>
                        <p>
                            Reduced manual data-extraction and reporting work
                            by 10&ndash;15 hours per week for audit teams by
                            replacing manual "find this table on every page"
                            work with a point-and-click, template-driven
                            pipeline.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <p>Internal DTCC tooling — happy to walk through it live.</p>
                    </li>
                </ul>
                */}
            </div>
 
            {/* ── SnapSteps — Automated Tutorial/SOP Generator (DTCC) ─────── */}
            <div className="text-block">
                <h2>SnapSteps</h2>
                <br />
                <p>
                        <i>
                            Python &middot; pyautogui &middot; pynput &middot;
                            pytesseract (OCR) &middot; Pillow &middot; ReportLab
                            &middot; Tkinter
                        </i>
                </p>
                <br />
                <p>
                    Also built during my DTCC internship, SnapSteps is a
                    screen-activity recorder that watches a workflow being
                    performed once and auto-generates a polished, step-by-step
                    PDF tutorial from it — an internal alternative to tools like
                    Scribe or Loom.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Built a global mouse/keyboard listener that captures
                            a cropped, zoomed, highlighted screenshot on every
                            click and runs OCR to auto-generate a description of
                            the action taken.
                        </p>
                    </li>
                    <li>
                        <p>
                            Added a drag-and-drop step editor and a floating
                            always-on-top control panel for reviewing and
                            adjusting a recording before export.
                        </p>
                    </li>
                    <li>
                        <p>
                            Exported recordings to a formatted PDF tutorial —
                            cover page, auto-generated table of contents,
                            section headers, and screenshots — built with
                            ReportLab, cutting documentation and training prep
                            time by 50&ndash;60% (6&ndash;8 hours per tutorial).
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <p>Internal DTCC tooling — happy to walk through it live.</p>
                    </li>
                </ul>
                */}
            </div>

                        {/* ── Volleyball Video Analysis Platform ─────────────────────── */}
            <div className="text-block">
                <h2>Volleyball Video Analysis Platform</h2>
                <br />
                <p>
                        <i>
                            Python &middot; PyTorch &middot; YOLOv8 &middot;
                            OpenCV &middot; Computer Vision &middot; React
                        </i>
                </p>
                <br />
                <p>
                    An AI-powered volleyball video analysis platform inspired
                    by tools like Balltime that turns recorded match footage
                    into searchable, structured performance data. The system
                    uses computer vision to identify players, track movement,
                    and analyze plays directly from game footage.
                </p>
                <br />
                <ul>
                    <li>
                        <p>
                            Built a computer vision pipeline using{' '}
                            YOLOv8 and PyTorch to detect and track
                            volleyball players across recorded match footage,
                            providing the foundation for automated player and
                            play analysis.
                        </p>
                    </li>
                    <li>
                        <p>
                            Developed video-processing workflows with{' '}
                            OpenCV to extract frames, synchronize
                            detections across time, and convert raw match
                            footage into structured data for downstream
                            analysis.
                        </p>
                    </li>
                    <li>
                        <p>
                            Designed the platform around searchable video
                            events and player-level statistics, allowing
                            users to move from raw game footage to specific
                            rallies, players, and performance insights.
                        </p>
                    </li>
                </ul>
                {/*
                <br />
                <h3>Links:</h3>
                <ul>
                    <li>
                        <a
                            rel="noreferrer"
                            target="_blank"
                            href="https://github.com/aryanj108"
                        >
                            <p>
                                <b>[GitHub]</b> - Volleyball Video Analysis
                                Platform
                            </p>
                        </a>
                    </li>
                </ul>
                */}
            </div>

            <ResumeDownload />
        </div>
    );
};

export default SoftwareProjects;
