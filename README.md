# QuickFSM

QuickFSM is a simple finite state machine react component that can be edited graphically and evaluated programmatically.
Choose this if you need basic functionality with minimal setup effort.

- Easy to set up: Single React component with just 3 mandatory props
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
import { useRef } from 'react';
import { Button, ChakraProvider, HStack, VStack } from '@chakra-ui/react';
import { FsmAction, FsmHandle, FsmTrigger, QuickFSM } from 'quick-fsm';

function App() {

  const initialStates = [{ label: "One" }, { label: "Two" }, { label: "Three" }];
  const initialTransitions = [{ source: 0, target: 1 }];

  const actions: FsmAction[] = [
    {
      id: 0,
      label: 'A0',
      color: '#66ff33'
    },
    {
      id: 1,
      label: 'A1',
      color: '#33ccff'
    },
    {
      id: 2,
      label: 'A2',
      color: '#ff66cc'
    }
  ];

  const triggers: FsmTrigger[] = [
    {
      id: 0,
      label: 'T0',
      color: '#66ff33'
    },
    {
      id: 1,
      label: 'T1',
      color: '#33ccff'
    }
  ];

  // We use this to trigger transitions (see below)
  var fsmRef: React.MutableRefObject<FsmHandle | null> = useRef(null);

  // The parent container of QuickFSM always need an explicit height
  var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  return (
    // Always surround QuickFSM in a Chakra provider
    <ChakraProvider>
      <VStack height={height}>
        <HStack>
          <Button bg={'#66ff33'} onClick={() => fsmRef.current?.triggerTransition(0)}>T0</Button>
          <Button bg={'#33ccff'} onClick={() => fsmRef.current?.triggerTransition(1)}>T1</Button>
        </HStack>
        <QuickFSM
          ref={fsmRef}
          initialStates={initialStates}
          initialTransitions={initialTransitions}
          triggers={triggers}
          actions={actions}
          actionCallback={function (id: number): void {
            // This is the callback to received the actions of the active node
            console.log(id);
          }} />
      </VStack>
    </ChakraProvider>
  );
}
```

