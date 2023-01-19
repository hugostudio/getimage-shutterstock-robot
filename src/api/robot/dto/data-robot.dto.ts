export class DataRobotDto {
  url: string;
  title: { text: string };
  elements: [
    {
      type: string;
      value: string;
      sentences: [];
    },
  ];
}
