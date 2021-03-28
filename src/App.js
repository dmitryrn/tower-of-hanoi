import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import "./styles.css";

const smallestDiskPercentOfLargest = 0.2;

const getLargestDiskWidth = () => {
  const stackEl = document.querySelector(".stack");
  if (!stackEl) return 0;
  return stackEl.clientWidth - 40;
};

const selectingDiskCount = 0;
const nothingHappening = 1;
const waitingClickADestinationStack = 2;

const firstTime = 0;
const clickedTheFirstStack = 1;
const clickedAnEmptyStack = 2;

export default function App() {
  const [disksCount, setDisksCount] = useState(4);

  const [tutorialState, setTutorialState] = useState(firstTime);

  const [appState, setAppState] = useState(selectingDiskCount);
  const [selectedStack, setSelectedStack] = useState(0);

  const [widths, setWidths] = useState(
    Array.from({ length: disksCount }).map((_, i) => 0)
  );

  const [stack1, setStack1] = useState(
    Array.from({ length: disksCount }).map((_, i) => i)
  );
  const [stack2, setStack2] = useState([]);
  const [stack3, setStack3] = useState([]);

  const getStackByIndex = (i) => {
    console.log(i);

    switch (i) {
      case 0:
        return stack1;
      case 1:
        return stack2;
      case 2:
        return stack3;
      default:
        throw Error("invalid index pick. index: " + i);
    }
  };

  const recalculateItemWidths = useCallback(() => {
    const largestDiskWidth = getLargestDiskWidth();

    const lengths = [...Array.from({ length: disksCount })];
    lengths[lengths.length - 1] = largestDiskWidth;
    const growPercent = (1 - smallestDiskPercentOfLargest) / (disksCount - 1);
    for (let i = lengths.length - 2; i >= 0; i--) {
      const difference = lengths.length - 1 - i;
      const herePercent = 1 - growPercent * difference;
      lengths[i] = largestDiskWidth * herePercent;
    }
    setWidths(lengths);
  }, [disksCount]);

  useEffect(() => {
    window.onresize = recalculateItemWidths;
    return () => {
      window.onresize = undefined;
    };
  }, [recalculateItemWidths]);

  useEffect(() => {
    const id = setInterval(() => {
      recalculateItemWidths();
    }, 500);
    return () => {
      clearInterval(id);
    };
  }, [recalculateItemWidths]);

  useLayoutEffect(() => {
    setTimeout(recalculateItemWidths, 500);
  }, [recalculateItemWidths]);

  const onStackClick = (stackIndex) => {
    if (stack3.length === disksCount) {
      alert("You won! Good job king");
    }

    if (tutorialState === firstTime && stackIndex === 0) {
      setTutorialState(clickedTheFirstStack);
    }
    if (tutorialState === clickedTheFirstStack && stackIndex > 0) {
      setTutorialState(clickedAnEmptyStack);
    }
    if (tutorialState === clickedTheFirstStack && stackIndex === 0) {
      setTutorialState(firstTime);
    }

    if (appState === nothingHappening) {
      const selectedStack = getStackByIndex(stackIndex);
      if (!selectedStack.length) {
        return;
      }
      setAppState(waitingClickADestinationStack);
      setSelectedStack(stackIndex);
    }
    if (appState === waitingClickADestinationStack) {
      let stackFrom = getStackByIndex(selectedStack);
      let stackTo = getStackByIndex(stackIndex);
      if (stackFrom === stackTo) {
        setAppState(nothingHappening);
        setSelectedStack(0);
        return;
      }
      const topDiskFrom = stackFrom[0];
      const topDiskTo = stackTo[0];
      if (topDiskFrom > topDiskTo) {
        return console.log("agains the rules");
      }
      stackFrom.shift();
      stackTo.unshift(topDiskFrom);
      setAppState(nothingHappening);
      setSelectedStack(0);
    }
  };

  console.log(appState);

  return (
    <div>
      {appState !== selectingDiskCount ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          {[stack1, stack2, stack3].map((stack, i) => {
            return (
              <div
                onClick={() => onStackClick(i)}
                className="stack"
                key={i}
                style={{
                  border:
                    appState === waitingClickADestinationStack &&
                    selectedStack === i
                      ? "3px solid red"
                      : "3px solid black",
                  width: "100%",
                  padding: 5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                {stack.map((disk) => (
                  <div
                    style={{
                      height: 20,
                      border: "1px solid black",
                      backgroundColor: "orange",
                      marginBottom: 5,
                      width: widths[disk]
                    }}
                    id={disk === disksCount - 1 ? "largest-disk" : undefined}
                    key={disk}
                  ></div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <p>Decide how many disks do you need. I recommend 4 first</p>
          <input
            type="number"
            value={disksCount}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!v) {
                return;
              }
              setDisksCount(v);
            }}
          />
          <button
            onClick={() => {
              if (disksCount < 1 && disksCount > 10) {
                alert(
                  "does it really make sense to pick less than 1 or more than 10 disks?"
                );
                return;
              }
              setAppState(nothingHappening);
            }}
          >
            Confirm
          </button>
        </>
      )}
      <div>
        <p>
          This is the game called Tower of Hanoi. You need to move all the{" "}
          <span style={{ color: "orange" }}>orange</span> disks from the left
          spot to the very right spot to win.
        </p>
        {tutorialState === firstTime && <p>Click the first stack</p>}
        {tutorialState === clickedTheFirstStack && (
          <p>Good. Now click an empty stack</p>
        )}
        {tutorialState === clickedAnEmptyStack && (
          <p>
            Nice, now repeat till you have all the disks on the very right spot
          </p>
        )}
      </div>
    </div>
  );
}
