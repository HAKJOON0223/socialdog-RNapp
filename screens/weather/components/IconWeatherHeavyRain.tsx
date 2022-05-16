import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {IWeatherIconProps} from '../template/WeatherIcon';

function IconWeatherHeavyRain({size}: IWeatherIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" fill="none">
      <Path
        d="M194.969 98.1333C194.99 97.5017 195 96.8674 195 96.2307C195 65.1647 170.152 39.9807 139.5 39.9807C115.185 39.9807 94.5218 55.8284 87.0176 77.8886C81.6283 75.0382 75.4999 73.4266 69 73.4266C47.4609 73.4266 30 91.1235 30 112.954C30 134.784 47.4609 152.481 69 152.481L139.5 152.481C139.525 152.481 139.55 152.481 139.575 152.481H181.5C197.24 152.481 210 139.548 210 123.596C210 112.58 203.917 103.005 194.969 98.1333Z"
        fill="white"
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M96.7021 163.499C94.0758 162.646 91.2551 164.083 90.4017 166.71L73.3651 219.143C72.5118 221.769 73.9491 224.59 76.5753 225.443C79.2016 226.297 82.0224 224.859 82.8757 222.233L99.9123 169.8C100.766 167.174 99.3284 164.353 96.7021 163.499ZM156.882 163.499C154.256 162.646 151.435 164.083 150.581 166.71L133.545 219.143C132.691 221.769 134.129 224.59 136.755 225.443C139.381 226.297 142.202 224.859 143.055 222.233L160.092 169.8C160.945 167.174 159.508 164.353 156.882 163.499ZM110.534 166.71C111.387 164.083 114.208 162.646 116.834 163.499C119.461 164.353 120.898 167.174 120.045 169.8L107.125 209.563C106.272 212.189 103.451 213.626 100.824 212.773C98.1982 211.92 96.761 209.099 97.6143 206.473L110.534 166.71ZM176.765 163.499C174.139 162.646 171.318 164.083 170.465 166.71L157.545 206.473C156.692 209.099 158.129 211.92 160.755 212.773C163.381 213.626 166.202 212.189 167.056 209.563L179.975 169.8C180.829 167.174 179.391 164.353 176.765 163.499ZM70.2697 166.71C71.123 164.083 73.9438 162.646 76.5701 163.499C79.1963 164.353 80.6336 167.174 79.7803 169.8L70.9773 196.892C70.124 199.519 67.3032 200.956 64.677 200.103C62.0507 199.249 60.6134 196.429 61.4668 193.802L70.2697 166.71ZM136.965 163.499C134.339 162.646 131.518 164.083 130.665 166.71L121.862 193.802C121.009 196.429 122.446 199.249 125.072 200.103C127.699 200.956 130.519 199.519 131.373 196.892L140.176 169.8C141.029 167.174 139.592 164.353 136.965 163.499Z"
        fill="#B4F5F2"
      />
    </Svg>
  );
}

export default IconWeatherHeavyRain;