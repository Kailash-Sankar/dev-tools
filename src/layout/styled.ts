import styled from 'styled-components'

export const ContentWrapper = styled.div`
    width: 100%;
    background-image: radial-gradient(#212121 20%, #0000 20%), radial-gradient(#fafafa 20%, #41050514 20%);
    background-color: #262b5c4d;
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

export const TypeEffect = styled.div`
   overflow: hidden;
  border-right: .15em solid orange;
  white-space: nowrap;
  margin: 0 auto;
  letter-spacing: .15em;
  animation:  typing 3.5s steps(40, end), blink-caret .75s step-end infinite;

  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }

  @keyframes blink-caret {
   from, to { border-color: transparent }
   50% { border-color: orange; }
  }
`;