import AdmZip from "adm-zip";
import * as fs from 'fs';
import fsPromises from 'fs/promises'
import path, { join } from 'path';
import { image } from 'image-downloader';
import { AnyNode, load as _load } from 'cheerio';
import requestPromise from 'request-promise';
import * as dotenv from "dotenv";

dotenv.config();

const imageMagick = require('gm').subClass({
  imageMagick: true,
});

const imageTempDir = process.env.IMAGE_TEMP_DIR as string;
const appPath = process.env.APP_PATH as string;
export const QUEUE_NAME = process.env.QUEUE_DEFAULT as string;

const robotServer = {
  execute: async (data: any) => {
    console.debug('Processando [%s]');

    const images : any = await fetchImages(data);

    console.debug('> Quantidade de imagens encontradas [%d]', images['length']);
   
    let imagesDownloadeds: string | any[] = [];
    if (images['length'] > 0) {
      imagesDownloadeds = await downloadAllImages(images);
    }

    if (imagesDownloadeds.length > 0) {
      await cropImages(imagesDownloadeds);
      return await createZipArchive(data.projectId);
    }
  },
  
  deleteAllTempArchive: async () =>{
    const downloadDir = path.join(appPath,imageTempDir);
    try {
      await emptyFolder(downloadDir);
      //fs.rmSync(downloadDir,{ recursive: true })
      console.log(`${downloadDir} is deleted!`);
    } catch (err) {
      console.error(`Error while deleting ${downloadDir}.`)
    }
  }
};

async function fetchImages(data : any) {
  // contar as sentenças
  let qtdSentencas = 1; // começa em 1 por conta do titulo
  for (let e = 0; e < data.elements.length; e++) {
    if (data.elements[e].type != 'table') {
      if (data.elements[e].type == 'ul' || data.elements[e].type == 'ol') {
        for (let nLi = 0; nLi < data.elements[e].items.length; nLi++) {
          qtdSentencas += data.elements[e].items[nLi].sentences.length;
        }
      } else {
        qtdSentencas += data.elements[e].sentences.length;
      }
    }
  }

  const sKeyword = data.title.keyword.toLowerCase();

  console.log('> Palavra chave [%s]', sKeyword);
  console.log(
    '> Quantidade de imagem esperada (sentenças) [%d]',
    qtdSentencas,
  );
  
  const sUrl = `https://www.shutterstock.com/en/search/${encodeURI(
    sKeyword,
  )}?search_source=base_landing_page&orientation=horizontal&image_type=photo&mreleased=true`;

  const options = {
    uri: sUrl,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36', // optional headers
    },
    transform: function (body: string | Buffer | AnyNode | AnyNode[]) {
      return _load(body);
    },
  };

  const images = await scraperImagesPage(options, qtdSentencas);

  return images;
};

async function scraperImagesPage(options: any, max: number) {
  return new Promise((_resolve, _reject) => {
    requestPromise(options)
      .then(($: (arg0: string) => any) => {
        const aListImages = $("a[href*='/image-photo/']");
        const aImagesFounded = [];
        for (let i = 0; i < aListImages.length; i++) {
          const a = aListImages[i];
          const aHref = a.attribs.href.split('-');
          aHref[aHref.length - 2] = '260nw';
          const sLink =
            'https://image.shutterstock.com' + aHref.join('-') + '.jpg';
          // Pego o link do href porque os links das imagens só são carregadas quando navega para baixo na página
          // Na página o link está assim
          // /image-photo/muslim-woman-doing-sport-exercise-daughter-1938276298
          // Transformo para esse link
          // https://image.shutterstock.com/image-photo/muslim-woman-doing-sport-exercise-260nw-1938276298.jpg
          aImagesFounded.push(sLink);
          if (aImagesFounded.length == max) {
            break;
          }
        }
        _resolve(aImagesFounded);
      })
      .catch((err) => {
        console.log(err);
        _reject(err);
      });
  });
};

async function downloadAllImages (images: string | any[]) {
  const urlImagesDownloadeds: any[] = [];
  const imagesDownloadeds = [];
  const downloadDir = path.join(appPath,imageTempDir);
  if (!fs.existsSync(downloadDir)) {    
    console.log('> Diretório [%s] não existe !', downloadDir);    
  } else {
    console.log('> downloadDir : ', downloadDir);    
  }

  let imageName;
  for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
    const imageUrl = images[imageIndex];

    try {
      if (!urlImagesDownloadeds.includes(imageUrl)) {
        imageName = `${imageIndex + 1}-original.jpg`;
        const imageDownloaded = await downloadAndSave(
          imageUrl,
          imageTempDir,
          imageName,
        );
        imagesDownloadeds.push(imageDownloaded);
        urlImagesDownloadeds.push(imageUrl);
      }
    } catch (error) {
      console.log(`Erro [${imageName}] (${imageUrl}): ${error}`);
    }
  }
  return imagesDownloadeds;
};

async function cropImages (images: string | any[]) {
  // recortar as imagens para tirar a identificação
  let imageName: any;
  for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
    try {
      imageName = images[imageIndex];
      await cropImage(imageName, 390, 260, imageName);
      console.log('>>> Cortada [%s]', imageName);
    } catch (error) {
      console.log(`Erro [${imageName}]: ${error}`);
    }
  }
};

async function downloadAndSave(url: any, filePath: string, fileName: string){
  return image({
    url: url,
    dest: join('../../', filePath, fileName),
  }).then(({ filename }) => {
    console.log('>> Sucesso [%s]', filename);    
    return filename;
  });
};

//const gm = require("gm");
async function cropImage ( inputFile: any, width: number, height: number, outputFile: any) {
  return new Promise<void>((resolve, reject) => {
    const input = inputFile;
    const output = outputFile;
    imageMagick(input)
      .crop(width, height, 0, 0)
      .write(output, (error: any) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
  });
}

async function createZipArchive(zipName:string) {
  try {
    const zip = new AdmZip();
    const outputFile = zipName + ".zip";
    zip.addLocalFolder(path.join(appPath,imageTempDir));
    const fileBuffer = zip.toBuffer();
    console.log(`Created ${outputFile} successfully`);
    return { data: fileBuffer, fileName: outputFile};
  } catch (e) {
    console.log(`Algo deu errado !. ${e}`);
  }
}

async function emptyFolder (folderPath: any){
  try {
      // Find all files in the folder
      const files = await fsPromises.readdir(folderPath);
      for (const file of files) {
          await fsPromises.unlink(path.resolve(folderPath, file));
          console.log(`${folderPath}/${file} has been removed successfully`);
      }
  } catch (err){
      console.log(err);
  }
}
export default robotServer;