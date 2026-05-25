import { Grid } from "@chakra-ui/react";
import Button from "../../components/Button";
import styles from "./DoorLockKeypad.module.css";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "←", "0", "↵"];

type Props = {
  onKey: (key: string) => void;
};

export default function DoorLockKeypad({ onKey }: Props) {
  return (
    <Grid
      className={styles.grid}
      templateColumns="repeat(3, 1fr)"
      templateRows="repeat(4, 1fr)"
      h="100%"
      p={4}
      gap={4}
      placeItems="center"
    >
      {KEYS.map((key) =>
        key === "↵" ? (
          <Button
            key={key}
            className={styles.button}
            variant="primary"
            borderRadius="100%"
            fontSize="xl"
            bg="var(--dl-key-enter-bg)"
            color="var(--dl-key-enter-text)"
            borderColor="var(--dl-key-enter-border)"
            border="1px solid"
            _hover={{ bg: "var(--dl-key-enter-bg)" }}
            _active={{ bg: "var(--dl-key-enter-active-bg)", color: "white", transition: "none" }}
            onClick={() => onKey(key)}
          >
            {key}
          </Button>
        ) : (
          <Button
            key={key}
            className={styles.button}
            variant="neutral"
            borderRadius="100%"
            fontSize="xl"
            bg="var(--dl-key-bg)"
            color="var(--dl-key-text)"
            borderColor="var(--dl-key-border)"
            _hover={{ bg: "var(--dl-key-hover-bg)", borderColor: "var(--dl-key-border)" }}
            _active={{ bg: "var(--dl-key-active-bg)", color: "var(--dl-key-text)", borderColor: "var(--dl-key-border)", transition: "none" }}
            onClick={() => onKey(key)}
          >
            {key}
          </Button>
        ),
      )}
    </Grid>
  );
}
