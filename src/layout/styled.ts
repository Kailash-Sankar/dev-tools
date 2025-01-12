import styled from 'styled-components'

export const ContentWrapper = styled.div`
    width: 100%;
    background-image: radial-gradient(#212121 20%, #0000 20%), radial-gradient(#fafafa 20%, #41050514 20%);
    background-color: #101c984d;
    background-position: 0 0, 50px 50px;
    background-size: 10px 10px;
`;

export const PanelWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 10px;
    flex-wrap: wrap;
`;

export const Panel = styled.div`
    flex: 1;
`

export const PreWrap = styled.div`
    padding: 10px;
    background-color: #282c34;
    color: #ffffff;
    font-family: monospace;
    white-space: pre-wrap;
`