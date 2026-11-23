export const searchFixture = {
  code: "OK",
  body: {
    content: [
      {
        appId: 2063507966,
        packageName: "org.telegram.messenger.web",
        minSdkVersion: 23,
        appName: "Telegram",
        shortDescription: "Fast and secure messaging.",
        iconUrl: null,
        appType: "MAIN",
        versionCode: 73469,
        versionName: "13.3.1",
        price: 0,
        averageUserRating: 3.96,
        totalRatings: 29849,
        roundedDownloadsText: "20 mln +",
      },
    ],
    pageNumber: 0,
    pageSize: 12,
    totalElements: 1,
    totalPages: 1,
  },
};

/** Upstream overallInfo response shape (see appDetailsSchema). */
export const detailsFixture = {
  appId: 2063507966,
  packageName: "org.telegram.messenger.web",
  appName: "Telegram",
  shortDescription: "Fast and secure messaging.",
  iconUrl: null,
  minSdkVersion: 23,
  versionCode: 73469,
  versionName: "13.3.1",
  companyName: "Telegram FZ-LLC",
  price: 0,
  rating: { average: 3.96, votes: 29849 },
  categories: ["social"],
  fullDescription: "Telegram is a fast and secure messaging application.",
  whatsNew: "Bug fixes and performance improvements.",
  fileSize: "79899094",
  targetSdkVersion: 36,
  maxSdkVersion: 0,
  minAndroidVersion: "6",
  downloads: "20000000",
  ageRestriction: { category: "12+", name: "12+" },
  fileUrls: [],
  signatures: ["49c1522548ebacd46ce322b6fd47f6092bb745d0f88082145caf35e14dcc38e1"],
  appVerUpdatedAt: "2026-11-21T12:02:33.514Z",
  firstPublishedAt: "2023-10-13T22:10:00Z",
  deviceTypes: ["MOBILE"],
  versionId: 2064970947,
};

/** Upstream v3 download-link response (see downloadV3Schema). */
export const downloadV3Fixture = {
  appId: 2063507966,
  versionCode: 73469,
  versionId: 2064970947,
  signature: null,
  downloadUrls: [
    {
      url: "https://static-m.rustore.ru/2026/11/21/release.zip",
      size: 79899094,
      hash: "f9ccec87",
    },
  ],
};
