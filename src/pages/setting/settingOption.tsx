import * as React from 'react';
import { Link } from 'react-router-dom';

interface ISettingOptionProps {
  title: string;
  description: string;
  onClick?: () => void;
  disabled: boolean;
  arrow: boolean;
  navigatePath?: string;
  inBettermiPath: boolean;
}

const SettingOption: React.FunctionComponent<ISettingOptionProps> = (props) => {
  const { title, description, onClick, disabled, arrow, navigatePath, inBettermiPath } = props;
  return (
    <Link to={navigatePath || "#"} className={disabled ? "disabled-link" : undefined} target={inBettermiPath ? undefined : "_blank" } rel={inBettermiPath ? undefined : "noopener noreferrer" } style={{ width: "100%"}}>

    <div className={disabled ? "setting-option-container brightness-0-5" : "setting-option-container"} onClick={onClick}>
      <div className="setting-option-left-container inter-normal-cadet-blue-2-15px">{title}</div>
      <div className={"setting-option-right-container"}>
        <div className="setting-option-description inter-normal-white-15px">{description}</div>
        {arrow && <img src={`${process.env.PUBLIC_URL}/img/setting/icon-ionic-ios-arrow-forward-1@1x.png`} alt="arrow-right" className="setting-option-arrow" />}
      </div>
    </div>
    </Link>
    );
};

export default SettingOption;
