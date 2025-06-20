import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

function DocumentSvg(props: any) {
  return (
    <Svg
      height="30px"
      width="20px"
      viewBox="0 0 1024 1024"
      className="icon"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <Path d="M709.8 651.8a10 10 0 1020 0 10 10 0 10-20 0z" fill="#E73B37" />
      <Path
        d="M512.1 64H172v896h680V385.6L512.1 64zm278.8 324.3h-280v-265l280 265zM808 916H216V108h278.6l.2.2v296.2h312.9l.2.2V916z"
        fill="#000"
      />
      <Path d="M280.5 530h325.9v16H280.5z" fill="#39393A" />
      <Path d="M639.5 530h90.2v16h-90.2z" fill="#E73B37" />
      <Path d="M403.5 641.8h277v16h-277z" fill="#39393A" />
      <Path d="M280.6 641.8h91.2v16h-91.2z" fill="#E73B37" />
      <Path d="M279.9 753.7h326.5v16H279.9z" fill="#39393A" />
      <Path d="M655.8 753.7h73.9v16h-73.9z" fill="#E73B37" />
    </Svg>
  );
}

export default DocumentSvg;
