## Minecraft Blocks for CDN

> This repository is fork of https://github.com/Mojang/bedrock-samples

CDN is designed to return rendered blocks by `blocks_name`.png

WARN: As this repository is still in development, some blocks are not supported and not rendered or returning broken images (e.g. fence, door, and some blocks that is not shaped like a cube).

> ↑I NEED YOUR HELP TO FIX THEM. PLEASE CONTRIBUTE TO THIS REPOSITORY :)

To find missing blocks, run `render.ts` and check `dist/missing_blocks.txt`.

### Generate `block_name.png`

Run `pnpm start` to generate `block_name.png` in `dist/`.

### Upload to S3

Set `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, `S3_BUCKET` in environment variables.
GitHub Actions will upload all images to S3.
