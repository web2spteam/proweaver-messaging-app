import * as React from "react";

type InitialsAvatarProps = {
  name: string;
  shape?: string;
  size?: number;
  fontSize?: string;
};

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name,
  shape = "rounded-full",
  size = 10,
  fontSize = "base",
}) => {
  const stringToColor = (string: string) => {
    let hash = 0;
    let i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let hexColor = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      hexColor += `00${value.toString(16)}`.slice(-2);
    }

    return hexColor;
  };

  const color = stringToColor(name);
  return (
    <>
      <div
        className={`w-${size} h-${size} relative inline-flex items-center justify-center overflow-hidden ${shape}`}
        style={{ backgroundColor: `${color}5f` }}
      >
        <span
          className={`font-bold text-${fontSize}`}
          style={{ color: color }}
        >{`${name.split(" ")[0][0]}${name.split(" ")[1][0]}`}</span>
      </div>
    </>
  );
};

export default InitialsAvatar;
