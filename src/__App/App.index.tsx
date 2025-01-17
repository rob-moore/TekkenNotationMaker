import { useRef, useState } from "react";
import { saveAs } from "file-saver";
import {
  ArcadeButtonPaths,
  CharacterSpecificImagePaths,
  Tekken8ButtonPaths,
  ImagePaths,
  XboxButtonPaths,
  PlaystationButtonPaths,
} from "../__util/ImagePaths";
import {
  FaBackspace,
  FaFileDownload,
  FaTrashAlt,
  FaUndo,
} from "react-icons/fa";
import * as S from "./App.styled";
import * as htmlToImage from "html-to-image";
import { NotationImage } from "../__types/PathTypes";
import { characters } from "../__util/characters";
import { Footer } from "../components/Footer/Footer.index";
import { Theme } from "../__types/theme";

function App() {
  const divRef = useRef(null);
  const [theme, setTheme] = useState<Theme>("tekken8");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [topText, setTopText] = useState<string>("");
  const [bottomText, setBottomText] = useState<string>("");
  const [quality, setQuality] = useState<string>("medium");
  const [selectedCharacter, setSelectedCharacter] = useState<string>("bryan");
  const [comboNotation, setComboNotation] = useState<string[]>([]);
  const [lastKnownComboNotation, setLastKnownComboNotation] = useState<
    string[]
  >([]);

  async function generateImage() {
    // setIsLoading(true);
    const node = divRef.current;

    if (!node) {
      console.error("No node found.");
      return;
    }

    const dataUrl = await htmlToImage.toPng(node);
    saveAs(dataUrl, `T8ComboNotation_${quality}res.png`);
    setIsLoading(false);
  }

  const pushImageSrc = (imageSrc: string) => {
    setComboNotation([...comboNotation, imageSrc]);
  };

  const removeLastNotation = () => {
    const data = [...comboNotation];
    data.pop();
    setComboNotation(data);
  };

  const resetNotation = () => {
    if (comboNotation.length <= 0) {
      return;
    }

    setLastKnownComboNotation([...comboNotation]);
    setComboNotation([]);
  };

  const undoReset = () => {
    if (lastKnownComboNotation.length <= 0) {
      alert("No previous state set.");
      return;
    }
    setComboNotation(lastKnownComboNotation);
  };

  const handleCharacterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const characterName = e.target.value;
    setSelectedCharacter(characterName);
  };

  const Output = () => {
    return (
      <>
        <S.PreviewContainer>
          <h1>Output preview</h1>
          <div>
            <div>
              {topText && <p>{topText}</p>}
              <section>
                {comboNotation.map((imageSrc, index) => (
                  <S.NotationOutput
                    key={index}
                    src={imageSrc}
                    draggable={false}
                  />
                ))}
              </section>
              {bottomText && <p>{bottomText}</p>}
            </div>
          </div>
        </S.PreviewContainer>
        <S.NotationContainer
          $qualityMultiplier={
            quality === "high"
              ? 1
              : quality === "medium"
              ? 0.5
              : quality === "low"
              ? 0.1
              : 1
          }
        >
          <div ref={divRef}>
            {topText && <p>{topText}</p>}
            <section>
              {comboNotation.map((imageSrc, index) => (
                <S.NotationOutput key={index} src={imageSrc} />
              ))}
            </section>
            {bottomText && <p>{bottomText}</p>}
          </div>
        </S.NotationContainer>
      </>
    );
  };

  const images: NotationImage[] = Object.values(ImagePaths);
  const buttonImagesPath = () => {
    switch (theme) {
      case "tekken8":
        return Object.values(Tekken8ButtonPaths);
      case "arcade":
        return Object.values(ArcadeButtonPaths);
      case "xbox":
        return Object.values(XboxButtonPaths);
      case "playstation":
        return Object.values(PlaystationButtonPaths);
      default:
        return Object.values(Tekken8ButtonPaths);
    }
  };
  const buttonImages: NotationImage[] =
    buttonImagesPath() ?? Object.values(Tekken8ButtonPaths);
  const allImages = [...buttonImages, ...images];
  const characterImages = Object.values(
    CharacterSpecificImagePaths[selectedCharacter] ?? {}
  );

  const EditorNotationButtons = (props: { image: NotationImage }) => {
    const { image } = props;

    if (!image.src) {
      return;
    }

    return (
      <S.NotationButton
        src={image.src}
        alt={image.text}
        key={image.src}
        onClick={() => pushImageSrc(image.src)}
        draggable={false}
      />
    );
  };

  const CharacterDropdown = () => {
    function formatCharacterValue(name: string) {
      let newName = name;
      newName = newName.toLowerCase();
      newName = newName.replace(" ", "_");
      newName = newName.replace("-", "_");
      return newName;
    }

    return (
      <S.CharacterDropdown
        name="character-dropdown"
        value={selectedCharacter}
        onChange={handleCharacterChange}
      >
        {characters.map((item) => (
          <option value={formatCharacterValue(item)} key={item}>
            {item}
          </option>
        ))}
      </S.CharacterDropdown>
    );
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as Theme;
    setTheme(value);
  };

  return (
    <S.App>
      <Output />
      <S.EditorUI>
        <S.EditorOptions>
          <div>
            <label htmlFor="theme">Theme</label>
            <select name="theme" id="theme" onChange={handleThemeChange}>
              <option value="tekken8">TEKKEN 8</option>
              <option value="arcade">Arcade</option>
              <option value="playstation">PlayStation</option>
              <option value="xbox">XBox</option>
            </select>
          </div>

          <div>
            <label htmlFor="quality">Quality</label>
            <select
              name="quality"
              id="quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label htmlFor="top-text">Top Text (Optional)</label>
            <input
              type="text"
              name="top-text"
              placeholder="Top text"
              onChange={(e) => setTopText(e.target.value)}
              value={topText}
            />
          </div>

          <div>
            <label htmlFor="bottom-text">Bottom Text (Optional)</label>
            <input
              type="text"
              name="bottom-text"
              placeholder="Bottom text"
              onChange={(e) => setBottomText(e.target.value)}
              value={bottomText}
            />
          </div>
        </S.EditorOptions>
        <S.NotationButtons>
          {allImages.map((key: NotationImage) => (
            <EditorNotationButtons image={key} key={key.src} />
          ))}
          <S.HorizontalDivider />
          {characterImages.map((key: NotationImage) => (
            <EditorNotationButtons image={key} key={key.src} />
          ))}
        </S.NotationButtons>
        <S.EditorNav>
          <CharacterDropdown />
          <S.SaveButton onClick={() => generateImage()} disabled={isLoading}>
            <FaFileDownload />
          </S.SaveButton>
          <S.BackButton onClick={() => removeLastNotation()}>
            <FaBackspace />
          </S.BackButton>
          <S.ResetButton onClick={() => resetNotation()}>
            <FaTrashAlt />
          </S.ResetButton>
          <S.UndoButton
            onClick={() => undoReset()}
            disabled={lastKnownComboNotation.length <= 0}
          >
            <FaUndo />
          </S.UndoButton>
        </S.EditorNav>
      </S.EditorUI>
      <Footer />
    </S.App>
  );
}

export default App;
