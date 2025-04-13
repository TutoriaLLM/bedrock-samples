import fs from "fs";
import path from "path";

// ブロックデータの型定義
interface BlockTextures {
  up?: string;
  down?: string;
  side?: string;
}

interface BlockData {
  textures: string | BlockTextures;
}

// ブロックデータの読み込み
const blocks = JSON.parse(
  fs.readFileSync(path.join(__dirname, "resource_pack/blocks.json"), "utf8")
);

// 出力ディレクトリの設定
const DIST_DIR = path.join(__dirname, "dist");
const TEXTURE_BLOCKS_DIR = path.join(
  __dirname,
  "resource_pack",
  "textures",
  "blocks"
);
const TEXTURE_ITEMS_DIR = path.join(
  __dirname,
  "resource_pack",
  "textures",
  "items"
);

// 出力ディレクトリがなければ作成
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// テクスチャファイルを探す関数
function findTextureFile(filename: string): string | null {
  // まずアイテムディレクトリで検索（優先）
  const itemTexture = findTextureInDir(filename, TEXTURE_ITEMS_DIR);
  if (itemTexture) return itemTexture;

  // 次にブロックディレクトリで検索
  const blockTexture = findTextureInDir(filename, TEXTURE_BLOCKS_DIR);
  if (blockTexture) return blockTexture;

  return null;
}

// 指定ディレクトリ内でテクスチャを探す関数
function findTextureInDir(filename: string, dir: string): string | null {
  const targetName = filename.endsWith(".png") ? filename : `${filename}.png`;

  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      if (item.isFile() && item.name === targetName) {
        return itemPath;
      } else if (item.isDirectory()) {
        const found = findTextureInDir(filename, itemPath);
        if (found) {
          return found;
        }
      }
    }
  } catch (err) {
    // ディレクトリが存在しない場合はスキップ
    if (err instanceof Error && "code" in err && err.code !== "ENOENT") {
      console.error(
        `ディレクトリ ${dir} の読み取り中にエラーが発生しました:`,
        err
      );
    }
  }
  return null;
}

// テクスチャをそのまま出力する関数
function copyTexture(blockName: string, texturePath: string): boolean {
  console.log(`ブロック "${blockName}" のテクスチャを出力します...`);

  try {
    // テクスチャをそのままコピー
    const outputFilePath = path.join(DIST_DIR, `${blockName}.png`);
    fs.copyFileSync(texturePath, outputFilePath);
    console.log(`${blockName}.png を保存しました。`);
    return true;
  } catch (err) {
    console.error(`テクスチャのコピー中にエラーが発生しました:`, err);
    return false;
  }
}

// メイン処理
async function main() {
  console.log("ブロックのテクスチャ出力を開始します...");

  // 見つからなかったブロックのリスト
  const missingBlocks: string[] = [];

  // 各ブロックを処理
  for (const [blockName, blockData] of Object.entries(blocks) as [
    string,
    BlockData
  ][]) {
    try {
      // テクスチャパスを取得
      let texturePath: string | null = null;

      if (typeof blockData.textures === "string") {
        // 単一テクスチャの場合
        texturePath = findTextureFile(blockData.textures);
      } else if (typeof blockData.textures === "object") {
        // 複数テクスチャの場合は優先順位: up > side > down
        texturePath =
          (blockData.textures.up && findTextureFile(blockData.textures.up)) ||
          (blockData.textures.side &&
            findTextureFile(blockData.textures.side)) ||
          (blockData.textures.down &&
            findTextureFile(blockData.textures.down)) ||
          null;
      }

      if (texturePath) {
        copyTexture(blockName, texturePath);
      } else {
        console.log(
          `ブロック "${blockName}" はテクスチャが見つからないためスキップします。`
        );
        missingBlocks.push(blockName);
      }
    } catch (err) {
      console.error(
        `ブロック "${blockName}" の処理中にエラーが発生しました:`,
        err
      );
      missingBlocks.push(blockName);
    }
  }

  // 見つからなかったブロックの一覧を出力
  if (missingBlocks.length > 0) {
    const missingBlocksText = missingBlocks.join("\n");
    const outputFilePath = path.join(DIST_DIR, "missing_blocks.txt");
    fs.writeFileSync(outputFilePath, missingBlocksText);
    console.log(
      `見つからなかったブロック ${missingBlocks.length} 個を missing_blocks.txt に出力しました。`
    );
  } else {
    console.log("すべてのブロックが正常に処理されました。");
  }

  console.log("すべてのブロックの処理が完了しました。");
}

// 実行
main().catch((err) => {
  console.error("エラーが発生しました:", err);
});
