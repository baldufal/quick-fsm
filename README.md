# QuickFSM

QuickFSM is a simple finite state machine react component that can be edited graphically and evaluated programmatically.

- Easy to set up: Single React component with just 4 mandatory props
- Written in typescript
- Users can create and delete states and transitions
- Users can assign actions to states and triggers to transitions
- Triggers and actions are defined by the developer

## Installation
```shell
npm install quick-fsm    # using npm
pnpm install quick-fsm   # using pnpm
yarn add quick-fsm       # using yarn
```

## Usage
As the component uses UI components from the Chakra UI library, it must be wrapped in the ChakraProvider.
```js
import { ChakraProvider, VStack, HStack, Button } from "@chakra-ui/react";
import { Action, QuickFSMHandle, Trigger } from "quick-fsm";
import { useRef } from "react";
import { MdAccountBalance, MdAlarmOff } from "react-icons/md";


function ParentComponent() {

    const initialState = [
        {
            label: "One"
        },
        {
            label: "Two"
        },
    ];

    const actions: Action[] = [
        {
            id: 0,
            label: 'On',
            color: '#66ff33',
            active: false
        },
        {
            id: 4,
            label: 'A4',
            color: '#33ccff',
            active: false,
            icon: MdAlarmOff
        },
    ];

    const triggers: Trigger[] = [
        {
            id: 0,
            label: 'T0',
            color: '#66ff33',
            active: false
        },
        {
            id: 4,
            label: 'T4',
            color: '#33ccff',
            active: false,
            icon: MdAccountBalance
        }
    ];

    const stateMachineRef = useRef<QuickFSMHandle>(null);


    const handleTriggerTransition = (triggerId: number) => {
        if (stateMachineRef.current)
            stateMachineRef.current.triggerTransition(triggerId);
    };

    return (
        <ChakraProvider>
            <VStack width={"100%"} height={"100%"}>
                <HStack>
                    <Button onClick={() => handleTriggerTransition(0)}>
                        0
                    </Button>
                    <Button onClick={() => handleTriggerTransition(1)}>
                        1
                    </Button>
                    <Button onClick={() => handleTriggerTransition(2)}>
                        2
                    </Button>
                </HStack>
                <QuickFSM
                    ref={stateMachineRef}
                    initialState={initialState}
                    triggers={triggers}
                    actions={actions}
                    actionCallback={(id) => console.log("Action: " + id)} />
            </VStack>
        </ChakraProvider>
    );
}
```

