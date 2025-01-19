import styled from 'styled-components';

type SizeInfoProps = {
    isSavingPositive: boolean;
};

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

export const Toolbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

export const Panels = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
`;

export const Panel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: 1px solid #ccc;
  padding: 10px;
  margin: 0 10px;
`;

export const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
`;

export const SizeInfo = styled.div<SizeInfoProps>`
  color: ${(props) => (props.isSavingPositive ? "green" : "red")};
`;