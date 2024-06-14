import clsx from "clsx";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppLayout } from "@/layouts/app-layout";
import { useGoBack } from "@/utils/useBack";

import css from "./about.module.css";

function About() {
  const goBack = useGoBack();

  return (
    <AppLayout title="About">
      <div className={clsx("longform", css["about"])}>
        <Button onClick={goBack} variant="bare">
          <ChevronLeft /> Back
        </Button>
        <h1>About</h1>
        <p>
          The information presented in this app about Arkham Horror: The Card
          Game, both literal and graphical, is copyrighted by Fantasy Flight
          Games. This app is not produced, endorsed, supported, or affiliated
          with Fantasy Flight Games.
        </p>
        <p>
          This application was created by{" "}
          <a href="https://spoettel.dev" rel="noreferrer" target="_blank">
            Felix
          </a>{" "}
          and{" "}
          <a
            href="https://github.com/fspoettel/arkham-build/graphs/contributors"
            rel="noreferrer"
            target="_blank"
          >
            contributors
          </a>{" "}
          as a fan project to help support the Arkham Horror: The Card Game
          community. The source code of this project is available at{" "}
          <a
            href="https://github.com/fspoettel/arkham-build"
            rel="noreferrer"
            target="_blank"
          >
            Github
          </a>
          . Feedback and bug reports are welcome via Github issues or the
          dedicated channel on the Mythos Busters discord server.
        </p>
        <h4>Thanks 🌟</h4>
        <ul>
          <li>
            <strong>@zzorba:</strong> Access to the ArkhamCards API and icons,
            assistance with questions and inspiration for the deckbuilder.
            Without you this project would not have been possible. 🙇‍♂️
          </li>
          <li>
            <strong>@kamalisk &amp; ArkhamDB crew:</strong> Structured card data
            and images and many years of being the backbone of the community.
          </li>
          <li>
            <strong>@Chr1Z</strong>, <strong>@Butermelse</strong>,{" "}
            <strong>@5argon</strong>: Patient feedback and testing during
            development of the initial version.
          </li>
        </ul>
        <h5>Icon credits</h5>
        <ul>
          <li>
            <strong>Card icons:</strong> Fantasy Flight Games
          </li>
          <li>
            <strong>Logo design:</strong> Buteremelse
          </li>
          <li>
            <strong>Re-used ArkhamCards icons:</strong> Eugene Sarnetsky
          </li>
          <li>
            <strong>Other icons</strong>: lucide.dev
          </li>
        </ul>
      </div>
    </AppLayout>
  );
}

export default About;
