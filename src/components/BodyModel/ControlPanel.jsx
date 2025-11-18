// Icones svg (SVGR React components)
import LeftClick from "../../assets/Left_Click.svg?react";
import LeftMove from "../../assets/Left_Move.svg?react";
import RightClick from "../../assets/Right_Click.svg?react";
import ScrollWheel from "../../assets/Scroll_Wheel.svg?react";

const ControlPanel = () => {
    return (
                   <div className="absolute w-fit bottom-4 m-auto left-0 right-0 bg-slate-900/80 text-slate-100 px-3 py-2 rounded-xl text-sm shadow-lg border border-slate-700/60 backdrop-blur">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <LeftClick className="w-7 h-7 text-white" fill="white" />
                            <span>Sélectionner</span>
                          </div>
                          <div className="flex items-center justify-center gap-1.5">
                            <LeftMove className="w-7 h-7 text-white" fill="white" />
                            <span>Pivoter</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <RightClick className="w-7 h-7 text-white" fill="white" />
                            <span>Déplacer</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ScrollWheel className="w-7 h-7 text-white" fill="white" />
                            <span>Zoom</span>
                          </div>
                        </div>
                      </div>
    );
};

export default ControlPanel;