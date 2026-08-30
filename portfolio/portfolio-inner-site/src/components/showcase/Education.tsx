import React from 'react';
import ResumeDownload from './ResumeDownload';
import utAustinLogo from '../../assets/pictures/education/ut-austin-logo.svg';
import reedyLogo from '../../assets/pictures/education/reedy-hs-logo.svg';

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATION PAGE  (Aryan Jalota)
// -----------------------------------------------------------------------------
// Two schools shown side-by-side as beveled cards, matching the layout of the
// reference screenshot but restyled with this site's Win98 look (the same
// `big-button-container` bevel used by the Skills page cards).
// To ADD/EDIT a school: copy an <EducationCard /> below and change its props.
// ─────────────────────────────────────────────────────────────────────────────

export interface EducationProps {}

interface EducationCardProps {
    logo: string;
    logoBackground: string;
    school: string;
    program: string;
    dateLabel: string;
    dateValue: string;
    courses: string[];
    apCourses?: string[];
}

const EducationCard: React.FC<EducationCardProps> = ({
    logo,
    logoBackground,
    school,
    program,
    dateLabel,
    dateValue,
    courses,
    apCourses,
}) => {
    return (
        <div className="big-button-container" style={styles.card}>
            <div style={styles.cardHeader}>
                <div style={styles.cardHeaderText}>
                    <h2>{school}</h2>
                    <h4>{program}</h4>
                </div>
                <div
                    style={Object.assign({}, styles.logoBox, {
                        backgroundColor: logoBackground,
                    })}
                >
                    <img src={logo} alt={`${school} logo`} style={styles.logo} />
                </div>
            </div>
            <br />
            <p>
                <b>{dateLabel}:</b> {dateValue}
            </p>
            <br />
            <p>
                <b>Key Courses:</b> {courses.join(', ')}
            </p>
            {apCourses && (
                <>
                    <br />
                    <p>
                        <b>AP Courses:</b> {apCourses.join(', ')}
                    </p>
                </>
            )}
        </div>
    );
};

const Education: React.FC<EducationProps> = (props) => {
    return (
        <div className="site-page-content">
            <h1>Education</h1>
            <h3>& Coursework</h3>
            <br />
            <ResumeDownload />
            <br />
            <div style={styles.grid}>
                <EducationCard
                    logo={utAustinLogo}
                    logoBackground="#ffffff"
                    school="UT Austin"
                    program="BS in Computer Science"
                    dateLabel="Expected Graduation"
                    dateValue="May 2028"
                    courses={[
                        'Data Structures & Algorithms',
                        'Operating Systems',
                        'Computer Architecture',
                        'Object-Oriented Programming',
                        'Software Engineering',
                        'Machine Learning',
                        'Probability and Statistics in Computer Science',
                        'Linear Algebra',
                        'Discrete Math',
                    ]}
                />
                <EducationCard
                    logo={reedyLogo}
                    logoBackground="#ffffff"
                    school="Rick Reedy High School"
                    program="Frisco, TX"
                    dateLabel="Completed"
                    dateValue="May 2024"
                    courses={['Computer Science III', 'Mobile App Programming']}
                    apCourses={[
                        'AP Computer Science A',
                        'AP Computer Science Principles',
                        'AP Chemistry',
                        'AP Biology',
                        'AP World History',
                        'AP Human Geography',
                        'AP US History',
                        'AP Literature',
                        'AP Language & Composition',
                        'AP Seminar',
                        'AP Calculus BC',
                        'AP Environmental Science',
                    ]}
                />
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        gap: 24,
    },
    card: {
        flexDirection: 'column',
        flex: '1 1 420px',
        boxSizing: 'border-box',
    },
    cardHeader: {
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardHeaderText: {
        flexDirection: 'column',
        flex: 1,
        marginRight: 16,
    },
    logoBox: {
        width: 64,
        height: 64,
        minWidth: 64,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--border-field)',
        boxSizing: 'border-box',
        padding: 8,
    },
    logo: {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
    },
};

export default Education;
