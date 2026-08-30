import React, { useState } from 'react';
import me from '../../assets/pictures/robotics/robotics-team.jpg';
// import group from '../../assets/pictures/robotics/robotics-vid.mp4';
import meNow from '../../assets/pictures/aryan-2026.jpg';
import vbOne from '../../assets/pictures/volleyball/vb-solo.jpg';
//import vbTwo from '../../assets/pictures/volleyball/vb-group.jpg';
import vbThree from '../../assets/pictures/volleyball/vb-s.jpg';
import tiktok from '../../assets/pictures/tiktok.svg';
import { track } from '../../utils/analytics';
import { Link } from 'react-router-dom';
import ResumeDownload from './ResumeDownload';

export interface AboutProps {}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT PAGE
// -----------------------------------------------------------------------------
// Narrative and photos are Aryan's. Figure 1 is the static robotics photo; the
// click-through gallery below it (imageGallery) continues the numbering from
// Figure 2. To add a photo, drop it in src/assets/pictures/ and add an entry to
// imageGallery — the caption number follows its position automatically.
// ─────────────────────────────────────────────────────────────────────────────

const About: React.FC<AboutProps> = (props) => {
    const [currentImage, setCurrentImage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const imageGallery = [
        {
            image: meNow,
            description: 'Me, May 2026',
        },
        {
            image: vbOne,
            description: 'Playing with Baylor at Goodphil 2026',
        },
        //{
            //image: vbTwo,
            //description: 'A day at UT Austin',
        //},
        {
            image: vbThree,
            description: 'Grass volleyball in Austin, 2025',
        },
    ];

    const nextImage = () => {
        setIsTransitioning(true);

        setTimeout(() => {
            setCurrentImage((prev) => (prev + 1) % imageGallery.length);
        }, 300);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 700);
    };

    return (
        // add on resize listener
        <div className="site-page-content">
            {/* <img src={me} style={styles.topImage} alt="" /> */}
            <h1 style={{ marginLeft: -16 }}>Welcome</h1>
            <h3>I'm Aryan Jalota</h3>
            <br />
            <div className="text-block">
                <p>
                    I'll be joining Salesforce as an Applied AI Software Engineer Intern
                    in the Office of the CEO in San Francisco, CA! I'm a Computer Science
                    major at the University of Texas at Austin!
                </p>
                <br />
                <p>
                    Thank you for taking the time to check out my portfolio. I
                    really hope you enjoy exploring it as much as I enjoyed
                    building it. If you have any questions or comments, feel
                    free to contact me using{' '}
                    <Link to="/contact">this form</Link> or shoot me an email at{' '}
                    <a href="mailto:aryanjalota483@gmail.com">
                        aryanjalota483@gmail.com
                    </a>
                </p>
            </div>
            <ResumeDownload />
            <div className="text-block">
                <h3>About Me</h3>
                <br />
                <p>
                    From a young age, I have had a curiosity about how things worked. This naturally led me to
                    become absolutely obsessed with Lego and I fell in love with building things. In 2015, my 
                    family and I moved across the country from Illinois to Texas, where I attended elementary school, 
                    middle school, high school, and now college. In middle school, I joined the Lego Robotics team, 
                    which was my first real exposure to programming. 
                </p>
                <br />
                <div className="captioned-image">
                    <img src={me} style={styles.image} alt="" />
                    <p>
                        <sub>
                            <b>Figure 1:</b> Winning 3rd place at the State Level "Robo Wars" Competition :)
                        </sub>
                    </p>
                </div>

                <p>
                    I started programming more seriously in high school, 
                    initially using Java to learn object-oriented programming and build small games. 
                    Throughout high school, I continued exploring different areas of computer science, 
                    expanding my technical skills and developing a deeper interest in software engineering 
                    and artificial intelligence.
                </p>
                <br />
                <p>
                    In 2024, I was accepted into UT Austin to study Computer Science, my first-choice university, 
                    and was incredibly excited to begin my journey there. Since then, I’ve had the opportunity to 
                    work across industry and research. After my freshman year, I interned at DTCC, where I built 
                    automation tools and Python pipelines to improve internal workflows and reduce manual work. 
                    I also continued conducting computer vision and machine learning research at UT Austin, working 
                    with technologies like PyTorch, YOLOv8, and GPU-accelerated computing.
                </p>
                <br />
                <p>
                    More recently, I interned at Salesforce as an Applied AI Software Engineer in the Office of the 
                    CEO, where I worked on production AI systems, distributed backend infrastructure, LLM-powered workflows,
                     and enterprise data retrieval. Alongside my professional experience, I’ve continued building projects 
                     and collaborating with researchers and student teams at UT Austin, with a particular focus on AI, systems, 
                     and creating software that solves real-world problems.
                </p>
                <br />
                <br />
                <div style={{}}>
                    <div
                        style={{
                            flex: 1,
                            textAlign: 'justify',
                            alignSelf: 'center',
                            flexDirection: 'column',
                        }}
                    >
                        <h3>My Hobbies</h3>
                        <br />
                        <p>
                           Outside of coding, I have a lot of hobbies that I enjoy doing in my free time. 
                           The more apparent hobby is volleyball. Which I regularly merge with my background in 
                           CS to develop some pretty cool software. You can read more about this project in its
                           respective pages under my projects tab. Some other hobbies I enjoy are working out, hiking, 
                           cooking, and playing video games (obviously). 
                        </p>
                        <br />
                        <p>
                            In college, I completely fell in love with volleyball — I played
                            intramurals every semester and got on the court any chance I got.
                            I met a lot of incredible people through volleyball and have
                            become part of an amazing community.
                        </p>
                        <div style={styles.calloutContainer}>
                            <img
                                style={styles.calloutIcon}
                                src={tiktok}
                                alt=""
                            />
                            <div style={styles.calloutText}>
                                <h3>Check out my volleyball TikTok</h3>
                                <a
                                    rel="noreferrer"
                                    target="_blank"
                                    href="https://www.tiktok.com/@orion.vb"
                                    onClick={() => track('tiktok-click')}
                                >
                                    <p>@orion.vb</p>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div style={styles.verticalImage}>
                    <div
                        className={`pixel-image-wrapper ${
                            isTransitioning ? 'pixel-transition' : ''
                        }`}
                        onClick={nextImage}
                    >
                        <img
                            src={imageGallery[currentImage].image}
                            style={{
                                ...styles.image,
                                cursor: 'pointer',
                            }}
                            alt=""
                        />

                        {isTransitioning && (
                            <div className="pixel-transition-overlay">
                                {Array.from({ length: 980 }).map((_, i) => {
                                    const columns = 35;
                                    const rows = 28;

                                    const row = Math.floor(i / columns);
                                    const column = i % columns;

                                    // Center of the image
                                    const centerX = columns / 2;
                                    const centerY = rows / 2;

                                    // Distance from center
                                    const dx = column - centerX;
                                    const dy = row - centerY;

                                    const distance = Math.sqrt(dx * dx + dy * dy);

                                    // Angle around the center
                                    let angle = Math.atan2(dy, dx);
                                    if (angle < 0) angle += Math.PI * 2;

                                    // Combine distance + angle to create a spiral
                                    const spiralDelay =
                                        distance * 0.018 +
                                        angle * 0.015;

                                    return (
                                        <div
                                            key={i}
                                            className="pixel"
                                            style={{
                                                animationDelay: `${spiralDelay}s`,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}                    </div>

                    <p>
                        <sub>
                            {/* Figure 1 is the robotics photo above, so the
                                gallery continues the numbering from 2. */}
                            <b>Figure {currentImage + 2}:</b>{' '}
                            {imageGallery[currentImage].description}
                        </sub>
                    </p>
                </div>
                </div>
                <br />
                <br />
                <p>
                    Thanks for reading about me! I hope that you enjoy exploring
                    the rest of my portfolio website and everything it has to
                    offer. If you find the easter egg make sure to let me know
                    on LinkedIn{' '}
                    <a
                        rel="noreferrer"
                        target="_blank"
                        href="https://www.linkedin.com/in/aryanjalota/"
                    >
                        @aryanjalota
                    </a>{' '}
                    Good luck and have fun!
                </p>
                <br />
                <p>
                    If you have any questions or comments I would love to hear
                    them. You can reach me through the{' '}
                    <Link to="/contact">contact page</Link> or shoot me an email
                    at{' '}
                    <a href="mailto:aryanjalota483@gmail.com">
                        aryanjalota483@gmail.com
                    </a>
                </p>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    contentHeader: {
        marginBottom: 16,
        fontSize: 48,
    },
    image: {
        height: 'auto',
        width: '100%',
    },
    topImage: {
        height: 'auto',
        width: '100%',
        marginBottom: 32,
    },
    calloutContainer: {
        backgroundColor: 'white',
        padding: 12,
        marginTop: 24,
        boxSizing: 'border-box',
        border: '2px solid black',
        borderLeftWidth: 0,
        borderRightWidth: 0,
        width: '100%',
        alignItems: 'center',
    },
    calloutIcon: {
        width: 36,
        height: 36,
        paddingRight: 20,
    },
    calloutText: {
        flexDirection: 'column',
    },
    verticalImage: {
        alignSelf: 'center',
        // width: '80%',
        marginLeft: 32,
        flex: 0.8,

        alignItems: 'center',
        // marginBottom: 32,
        textAlign: 'center',
        flexDirection: 'column',
    },
};

export default About;
