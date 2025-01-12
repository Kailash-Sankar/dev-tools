import styled from "styled-components";

export const TypeEffect = styled.div`
   .key {
        font-size: 15vw;
        display: inline-block;
        letter-spacing: -1vw;
        transition: transform 0.2s;
        font-weight: 600;
    }

    @keyframes pressDown1 {
    30%,
    40%,
    100% {
        transform: translateY(0);
    }
    35% {
        transform: translateY(10px);
    }
    }

    @keyframes pressDown2 {
    70%,
    80%,
    100% {
        transform: translateY(0);
    }
    75% {
        transform: translateY(10px);
    }
    }

    @keyframes pressDown3 {
    30%,
    40%,
    100% {
        transform: translateY(0);
    }
    35% {
        transform: translateY(10px);
    }
    }

    @keyframes pressDown4 {
    40%,
    50%,
    100% {
        transform: translateY(0);
    }
    45% {
        transform: translateY(10px);
    }
    }

    @keyframes pressDown5 {
    20%,
    30%,
    100% {
        transform: translateY(0);
    }
    25% {
        transform: translateY(10px);
    }
    }

    @keyframes pressDown6 {
    60%,
    70%,
    100% {
        transform: translateY(0);
    }
    65% {
        transform: translateY(10px);
    }
    }

    @keyframes pressDown7 {
    10%,
    20%,
    100% {
        transform: translateY(0);
    }
    15% {
        transform: translateY(10px);
    }
    }

    @keyframes pressDown8 {
    35%,
    45%,
    100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(10px);
    }
    }
    .key:nth-child(1) {
    animation: pressDown1 2s infinite;
    }

    .key:nth-child(2) {
    animation: pressDown2 3s infinite;
    }

    .key:nth-child(3) {
    animation: pressDown3 4s infinite;
    }

    .key:nth-child(4) {
    animation: pressDown4 2.5s infinite;
    }

    .key:nth-child(5) {
    animation: pressDown5 2.5s infinite;
    }

    .key:nth-child(6) {
    animation: pressDown6 3.5s infinite;
    }

    .key:nth-child(7) {
    animation: pressDown7 2.2s infinite;
    }

    .key:nth-child(8) {
    animation: pressDown8 3.2s infinite;
    }

`;