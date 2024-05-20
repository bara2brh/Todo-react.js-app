import LocalizedStrings from 'react-localization';
import React, { useState } from 'react';

let strings = new LocalizedStrings({
    en:{
        headerTitle:"Todo List",
      sections:"Sections",
      sectionAdd:"Add Section",
      high:"Important",
      medium:"Less Importance",
      low:"Not Important",
      selectSection: "Select a Certain Section To Show The List",
    },
    ar: {
        headerTitle:"قائمة المهام",
      sections:"الأقسام",
      sectionAdd:"أضف قسم جديد",
      high:"مهم",
      medium:"متوسط الأهمية",
      low:"غير مهم",
      selectSection: "قم بإختيار قسم معين لعرض المهام",

    }
   });

   export default strings;
