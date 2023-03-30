import styled from "styled-components";

export const YoutubeEmbed = ({ src }: { src: string }) => (
  <VideoResponsive>
    <iframe
      width="853"
      height="480"
      src="https://www.youtube.com/embed/D0UnqGm_miA"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Embedded youtube"
    />
  </VideoResponsive>
);

const VideoResponsive = styled.div`
  overflow: hidden;
  padding-bottom: 50%;
  position: relative;
  height: 0;
  margin: 0 auto;
`;
