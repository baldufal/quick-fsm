import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, VStack, Wrap, Text } from "@chakra-ui/react";
import { Action, Trigger } from "../QuickFSM";
import ActionTrigger from "./ActionTrigger";
import React from "react";

export type SelectActionTriggerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    // Must be "triggers" or "actions" depending on context
    text: string;
    all: Action[] | Trigger[];
    selected: Action[] | Trigger[];
    unselected: Action[] | Trigger[];
    setSelected: (value: React.SetStateAction<Trigger[] | Action[]>) => void
    setUnSelected: (value: React.SetStateAction<Trigger[] | Action[]>) => void
};

function SelectActionTriggerModal({ isOpen,
    onClose,
    text,
    selected: selectedTriggers,
    unselected: unselectedTriggers,
    setSelected: setSelectedTriggers,
    setUnSelected: setUnselectedTriggers,
    all: triggers }: SelectActionTriggerModalProps) {

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Click {text} to (de)select</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack>
                        <Text>
                            Avialable {text}:
                        </Text>
                        <Wrap align={"center"}>
                            {unselectedTriggers.map((trigger, triggerIndex) =>
                                <ActionTrigger
                                    clickable
                                    key={triggerIndex}
                                    onClick={() => {
                                        const trig = triggers.find((trig) => trig == trigger);
                                        if (trig)
                                            trig.active = true;
                                        setSelectedTriggers([...selectedTriggers, unselectedTriggers[triggerIndex]]);
                                        setUnselectedTriggers([
                                            ...unselectedTriggers.slice(0, triggerIndex),
                                            ...unselectedTriggers.slice(triggerIndex + 1)
                                        ]);
                                    }}
                                    actionTrigger={trigger} />
                            )}
                        </Wrap>
                        <Text>
                            Selected {text}:
                        </Text>
                        <Wrap align={"center"}>{selectedTriggers.map((trigger, triggerIndex) =>
                            <ActionTrigger
                                clickable
                                key={triggerIndex}
                                onClick={() => {
                                    const trig = triggers.find((trig) => trig == trigger);
                                    if (trig)
                                        trig.active = false;
                                    setUnselectedTriggers([...unselectedTriggers, selectedTriggers[triggerIndex]])
                                    setSelectedTriggers([
                                        ...selectedTriggers.slice(0, triggerIndex),
                                        ...selectedTriggers.slice(triggerIndex + 1)
                                    ])
                                }
                                } actionTrigger={trigger}
                            />)}
                        </Wrap>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

export default SelectActionTriggerModal;