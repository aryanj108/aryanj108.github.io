import React, { useEffect, useState } from 'react';
import colors from '../../constants/colors';
import ghIcon from '../../assets/pictures/contact-gh.png';
import inIcon from '../../assets/pictures/contact-in.png';
import ResumeDownload from './ResumeDownload';

export interface ContactProps {}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM BACKEND — Web3Forms
// -----------------------------------------------------------------------------
// GitHub Pages is static-only, so the bundled Express/nodemailer server can't
// run. Messages go through Web3Forms instead, which relays them to the address
// the access key is registered to.
//
// TO ACTIVATE: get a free key at https://web3forms.com (enter your email, no
// account needed) and paste it below. Until then the form stays disabled and
// points people at the mailto link rather than silently failing.
//
// The key is a public client-side token by design — it can only send mail to
// the verified address it belongs to, so it's safe to commit. Rotate it at
// web3forms.com if it ever gets abused.
// ─────────────────────────────────────────────────────────────────────────────
// Typed as `string` (not the inferred literal '') so TypeScript doesn't treat
// the submit path below as unreachable while the key is still blank.
const WEB3FORMS_ACCESS_KEY: string = ''; // e.g. 'a1b2c3d4-0000-0000-0000-abcdef123456'
const CONTACT_API_ENDPOINT = 'https://api.web3forms.com/submit';
const CONTACT_EMAIL = 'aryanjalota483@gmail.com';

// function to validate email
const validateEmail = (email: string) => {
    const re =
        // eslint-disable-next-line
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

interface SocialBoxProps {
    icon: string;
    link: string;
}

const SocialBox: React.FC<SocialBoxProps> = ({ link, icon }) => {
    return (
        <a rel="noreferrer" target="_blank" href={link}>
            <div className="big-button-container" style={styles.social}>
                <img src={icon} alt="" style={styles.socialImage} />
            </div>
        </a>
    );
};

const Contact: React.FC<ContactProps> = (props) => {
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [formMessageColor, setFormMessageColor] = useState('');

    useEffect(() => {
        if (validateEmail(email) && name.length > 0 && message.length > 0) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [email, name, message]);

    async function submitForm() {
        if (!isFormValid) {
            setFormMessage('Form unable to validate, please try again.');
            setFormMessageColor('red');
            return;
        }
        // No access key yet — point people at email rather than failing silently.
        if (!WEB3FORMS_ACCESS_KEY) {
            setFormMessage(
                `Contact form isn't hooked up yet — please email me directly at ${CONTACT_EMAIL}!`
            );
            setFormMessageColor(colors.red);
            return;
        }
        try {
            setIsLoading(true);
            const res = await fetch(CONTACT_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    access_key: WEB3FORMS_ACCESS_KEY,
                    subject: `Portfolio contact from ${name}`,
                    from_name: 'Portfolio Site',
                    name,
                    email,
                    company: company || 'Not provided',
                    message,
                }),
            });
            // Web3Forms replies {success: true, message} or {success: false, message}
            const data = (await res.json()) as {
                success: boolean;
                message?: string;
            };
            if (data.success) {
                setFormMessage(`Message successfully sent. Thank you ${name}!`);
                setCompany('');
                setEmail('');
                setName('');
                setMessage('');
                setFormMessageColor(colors.blue);
                setIsLoading(false);
            } else {
                setFormMessage(
                    data.message || 'Something went wrong. Please try again.'
                );
                setFormMessageColor(colors.red);
                setIsLoading(false);
            }
        } catch (e) {
            setFormMessage(
                'There was an error sending your message. Please try again.'
            );
            setFormMessageColor(colors.red);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (formMessage.length > 0) {
            setTimeout(() => {
                setFormMessage('');
                setFormMessageColor('');
            }, 4000);
        }
    }, [formMessage]);

    return (
        <div className="site-page-content">
            <div style={styles.header}>
                <h1>Contact</h1>
                {/* CUSTOMIZE: your social links */}
                <div style={styles.socials}>
                    <SocialBox
                        icon={ghIcon}
                        link={'https://github.com/aryanj108'}
                    />
                    <SocialBox
                        icon={inIcon}
                        link={'https://www.linkedin.com/in/aryanjalota/'}
                    />
                </div>
            </div>
            <div className="text-block">
                <p>
                    I'm always open to new opportunities and would love to
                    chat! Whether it's about a role, a project, or just
                    systems and performance in general — feel free to reach out
                    via email, phone, or the form below.
                </p>
                <br />
                <p>
                    <b>Email: </b>
                    <a href="mailto:aryanjalota483@gmail.com">
                        aryanjalota483@gmail.com
                    </a>
                </p>
                <p>
                    <b>Phone: </b>
                    <a href="tel:+12145795745">214-579-5745</a>
                </p>

                <div style={styles.form}>
                    <label>
                        <p>
                            {!name && <span style={styles.star}>*</span>}
                            <b>Your name:</b>
                        </p>
                    </label>
                    <input
                        style={styles.formItem}
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label>
                        <p>
                            {!validateEmail(email) && (
                                <span style={styles.star}>*</span>
                            )}
                            <b>Email:</b>
                        </p>
                    </label>
                    <input
                        style={styles.formItem}
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label>
                        <p>
                            <b>Company (optional):</b>
                        </p>
                    </label>
                    <input
                        style={styles.formItem}
                        type="company"
                        name="company"
                        placeholder="Company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                    />
                    <label>
                        <p>
                            {!message && <span style={styles.star}>*</span>}
                            <b>Message:</b>
                        </p>
                    </label>
                    <textarea
                        name="message"
                        placeholder="Message"
                        style={styles.formItem}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <div style={styles.buttons}>
                        <button
                            className="site-button"
                            style={styles.button}
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            onMouseDown={submitForm}
                        >
                            {!isLoading ? (
                                'Send Message'
                            ) : (
                                <p className="loading">Sending</p>
                            )}
                        </button>
                        <div style={styles.formInfo}>
                            <p
                                style={Object.assign(
                                    {},
                                    { color: formMessageColor }
                                )}
                            >
                                <b>
                                    <sub>
                                        {formMessage
                                            ? `${formMessage}`
                                            : ' Prefer email? Reach me directly at aryanjalota483@gmail.com'}
                                    </sub>
                                </b>
                            </p>
                            <p>
                                <sub>
                                    {!isFormValid ? (
                                        <span>
                                            <b style={styles.star}>*</b> =
                                            required
                                        </span>
                                    ) : (
                                        '\xa0'
                                    )}
                                </sub>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <ResumeDownload altText="Need a copy of my Resume?" />
        </div>
    );
};

const styles: StyleSheetCSS = {
    form: {
        flexDirection: 'column',
        marginTop: 32,
    },
    formItem: {
        marginTop: 4,
        marginBottom: 16,
    },
    socialImage: {
        width: 36,
        height: 36,
    },
    buttons: {
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    formInfo: {
        textAlign: 'right',

        flexDirection: 'column',
        alignItems: 'flex-end',
        paddingLeft: 24,
    },
    star: {
        paddingRight: 4,
        color: 'red',
    },
    button: {
        minWidth: 184,
        height: 32,
    },
    header: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    socials: {
        marginBottom: 16,
        justifyContent: 'flex-end',
    },
    social: {
        width: 4,
        height: 4,
        // borderRadius: 1000,

        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
};

export default Contact;
