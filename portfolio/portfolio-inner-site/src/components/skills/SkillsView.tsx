import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS APP
// -----------------------------------------------------------------------------
// Brand logos are real SVGs pulled from simple-icons and stored in
//   src/assets/icons/skills/*.svg
// To ADD a skill: drop its <slug>.svg in that folder, import it below, and add
// an entry to the relevant category in the SKILL_CATEGORIES array.
// Skills without an official logo fall back to a colored monogram badge — just
// omit the `icon` field and (optionally) give a `color`.
//
// Rendered as a standalone desktop app (see applications/SkillsApp.tsx).
// ─────────────────────────────────────────────────────────────────────────────

// Brand logo SVGs (simple-icons, brand-colored)
import cplusplus from '../../assets/icons/skills/cplusplus.svg';
import python from '../../assets/icons/skills/python.svg';
import go from '../../assets/icons/skills/go.svg';
import java from '../../assets/icons/skills/java.svg';
import typescript from '../../assets/icons/skills/typescript.svg';
import javascript from '../../assets/icons/skills/javascript.svg';
import nvidia from '../../assets/icons/skills/nvidia.svg';
import pytorch from '../../assets/icons/skills/pytorch.svg';
import opencv from '../../assets/icons/skills/opencv.svg';
import numpy from '../../assets/icons/skills/numpy.svg';
import ultralytics from '../../assets/icons/skills/ultralytics.svg';
import linux from '../../assets/icons/skills/linux.svg';
import docker from '../../assets/icons/skills/docker.svg';
import kubernetes from '../../assets/icons/skills/kubernetes.svg';
import git from '../../assets/icons/skills/git.svg';
import githubactions from '../../assets/icons/skills/githubactions.svg';
import aws from '../../assets/icons/skills/aws.svg';
import apachespark from '../../assets/icons/skills/apachespark.svg';
import postgresql from '../../assets/icons/skills/postgresql.svg';
import mysql from '../../assets/icons/skills/mysql.svg';
import sqlite from '../../assets/icons/skills/sqlite.svg';
import redis from '../../assets/icons/skills/redis.svg';
import nodedotjs from '../../assets/icons/skills/nodedotjs.svg';
import express from '../../assets/icons/skills/express.svg';
import fastapi from '../../assets/icons/skills/fastapi.svg';
import react from '../../assets/icons/skills/react.svg';
import springboot from '../../assets/icons/skills/springboot.svg';
import grpc from '../../assets/icons/skills/grpc.svg';
import rocksdb from '../../assets/icons/skills/rocksdb.svg';

// Concept icons (Material Symbols, tinted to each skill's accent color)
import sql from '../../assets/icons/skills/sql.svg';
import gpucomputing from '../../assets/icons/skills/gpucomputing.svg';
import deeplearning from '../../assets/icons/skills/deeplearning.svg';
import computervision from '../../assets/icons/skills/computervision.svg';
import operatingsystems from '../../assets/icons/skills/operatingsystems.svg';
import distributedsystems from '../../assets/icons/skills/distributedsystems.svg';
import concurrency from '../../assets/icons/skills/concurrency.svg';
import parallelcomputing from '../../assets/icons/skills/parallelcomputing.svg';
import systemsprogramming from '../../assets/icons/skills/systemsprogramming.svg';
import performanceoptimization from '../../assets/icons/skills/performanceoptimization.svg';
import datastructures from '../../assets/icons/skills/datastructures.svg';
import oop from '../../assets/icons/skills/oop.svg';
import debugging from '../../assets/icons/skills/debugging.svg';
import restapis from '../../assets/icons/skills/restapis.svg';
import microservices from '../../assets/icons/skills/microservices.svg';
import containers from '../../assets/icons/skills/containers.svg';
import deltalake from '../../assets/icons/skills/deltalake.svg';
import hdf5 from '../../assets/icons/skills/hdf5.svg';

export interface SkillsViewProps {}

interface Skill {
    name: string;
    icon?: string; // brand logo SVG (omit for a monogram fallback)
    color?: string; // accent color for the monogram fallback
}

interface SkillCategory {
    title: string;
    skills: Skill[];
}

// -----------------------------------------------------------------------------
// EDIT YOUR SKILLS HERE  — mirrors the "Technical Skills" section of the resume
// -----------------------------------------------------------------------------
const SKILL_CATEGORIES: SkillCategory[] = [
    {
        title: 'Languages',
        skills: [
            { name: 'C++17', icon: cplusplus },
            { name: 'Python', icon: python },
            { name: 'Go', icon: go },
            { name: 'Java', icon: java },
            { name: 'TypeScript', icon: typescript },
            { name: 'JavaScript', icon: javascript },
            { name: 'SQL', icon: sql, color: '#e38c00' },
        ],
    },
    {
        title: 'GPU / ML',
        skills: [
            { name: 'CUDA', icon: nvidia },
            { name: 'PyTorch', icon: pytorch },
            { name: 'GPU Computing', icon: gpucomputing, color: '#76b900' },
            { name: 'Deep Learning', icon: deeplearning, color: '#ee4c2c' },
            { name: 'Computer Vision', icon: computervision, color: '#5c3ee8' },
            { name: 'OpenCV', icon: opencv },
            { name: 'YOLOv8', icon: ultralytics },
            { name: 'NumPy', icon: numpy },
        ],
    },
    {
        title: 'Systems',
        skills: [
            {
                name: 'Operating Systems',
                icon: operatingsystems,
                color: '#4d4d4d',
            },
            {
                name: 'Distributed Systems',
                icon: distributedsystems,
                color: '#2f6fed',
            },
            { name: 'Concurrency', icon: concurrency, color: '#8250df' },
            {
                name: 'Parallel Computing',
                icon: parallelcomputing,
                color: '#0f9d58',
            },
            {
                name: 'Systems Programming',
                icon: systemsprogramming,
                color: '#a42d0e',
            },
            {
                name: 'Performance Optimization',
                icon: performanceoptimization,
                color: '#d93025',
            },
            {
                name: 'Data Structures & Algorithms',
                icon: datastructures,
                color: '#1a73e8',
            },
            {
                name: 'Object-Oriented Programming',
                icon: oop,
                color: '#e37400',
            },
            { name: 'Debugging', icon: debugging, color: '#5f6368' },
        ],
    },
    {
        title: 'Infrastructure',
        skills: [
            { name: 'Linux', icon: linux },
            { name: 'Docker', icon: docker },
            { name: 'Kubernetes', icon: kubernetes },
            { name: 'AWS', icon: aws },
            { name: 'Git', icon: git },
            { name: 'CI/CD', icon: githubactions },
            { name: 'gRPC', icon: grpc, color: '#2496ed' },
            { name: 'REST APIs', icon: restapis, color: '#009688' },
            { name: 'Microservices', icon: microservices, color: '#6d4aff' },
            { name: 'Containers', icon: containers, color: '#0db7ed' },
        ],
    },
    {
        title: 'Data & Storage',
        skills: [
            { name: 'Apache Spark', icon: apachespark },
            { name: 'PostgreSQL', icon: postgresql },
            { name: 'MySQL', icon: mysql },
            { name: 'SQLite', icon: sqlite },
            { name: 'Redis', icon: redis },
            { name: 'Delta Lake', icon: deltalake, color: '#00add4' },
            { name: 'RocksDB', icon: rocksdb, color: '#2f74c0' },
            { name: 'HDF5', icon: hdf5, color: '#0064a5' },
        ],
    },
    {
        title: 'Frameworks',
        skills: [
            { name: 'Node.js', icon: nodedotjs },
            { name: 'Express', icon: express },
            { name: 'FastAPI', icon: fastapi },
            { name: 'React', icon: react },
            { name: 'Spring Boot', icon: springboot },
        ],
    },
];

const SkillRow: React.FC<{ skill: Skill }> = ({ skill }) => {
    const monogram = skill.name
        .replace(/[^a-zA-Z0-9+ ]/g, '')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 3)
        .toUpperCase();

    return (
        <div style={styles.row}>
            <div style={styles.iconWrap}>
                {skill.icon ? (
                    <img src={skill.icon} alt="" style={styles.icon} />
                ) : (
                    <div
                        style={Object.assign({}, styles.monogram, {
                            backgroundColor: skill.color || '#4d4d4d',
                        })}
                    >
                        {monogram}
                    </div>
                )}
            </div>
            <p style={styles.label}>{skill.name}</p>
        </div>
    );
};

const SkillsView: React.FC<SkillsViewProps> = () => {
    return (
        <div style={styles.page}>
            {SKILL_CATEGORIES.map((category) => (
                <div key={category.title} style={styles.section}>
                    <h1 style={styles.heading}>{category.title}</h1>
                    <div style={styles.grid}>
                        {category.skills.map((skill) => (
                            <SkillRow key={skill.name} skill={skill} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles: StyleSheetCSS = {
    page: {
        // .site-page is overflow:hidden and .site-page-content carries a 300px
        // sidebar margin meant for the showcase, so this owns its own scrolling.
        flexDirection: 'column',
        padding: 32,
        paddingTop: 24,
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        overflowY: 'auto',
    },
    section: {
        flexDirection: 'column',
        marginBottom: 28,
        width: '100%',
    },
    heading: {
        marginBottom: 16,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        columnGap: 24,
        rowGap: 14,
        width: '100%',
    },
    row: {
        alignItems: 'center',
    },
    iconWrap: {
        width: 28,
        height: 28,
        minWidth: 28,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        maxWidth: 28,
        maxHeight: 28,
        objectFit: 'contain',
    },
    monogram: {
        width: 28,
        height: 28,
        borderRadius: 4,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 10,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    label: {
        lineHeight: 1.1,
    },
};

export default SkillsView;
