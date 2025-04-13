import styled from 'styled-components'

export const ContentWrapper = styled.div`
    width: 100%;
    background-image: radial-gradient(#212121 20%, #0000 20%), radial-gradient(#fafafa 20%, #41050514 20%);
    background-color: #101c984d;
    background-position: 0 0, 50px 50px;
    background-size: 10px 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
`;

export const PanelWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    padding: 10px;
    flex-wrap: wrap;
    &.fullscreen {
      position: absolute;
      height: 100vh;
      width: 100vw;
      top: 0;
      left: 0;
      padding:10px;
      margin:0px;
      z-index: 99;
      overflow: hidden;
    }
`;

export const Panel = styled.div`
    flex: 1;
    max-width: 100%;
`

export const PreWrap = styled.div`
    padding: 10px;
    background-color: #282c34;
    color: #ffffff;
    font-family: monospace;
    white-space: pre-wrap;
`

export const SectionTitle = styled.div`
    margin-bottom: 5px;
    font-size: 14px;
`;

export const FlexRow =  styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
    flex-wrap: wrap;
`;

export const FlexCol =  styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;
