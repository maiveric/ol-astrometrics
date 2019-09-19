export const EULA_TITLE = 'NCRIC ALPR Policy and User Training Guide';

export const FIELDS = {
  TYPE: 'type',
  VALUE: 'value'
};

export const CONTENT_TYPES = {
  TEXT: 'text',
  BULLET: 'bullet'
};

export const EULA_CONTENT = {
  'NCRIC Mission': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `The Northern California Regional Intelligence Center (NCRIC)
      is a multi-jurisdiction public safety program created to assist local, state,
      federal, and tribal public safety agencies and critical infrastructure locations
      with the collection, analysis, and dissemination of criminal threat information.
      It is the mission of the NCRIC to protect the citizens of the fifteen Bay Area counties within
      its area of responsibility from the threat of narcotics trafficking, organized crime, as well
      as international, domestic, and street terrorism-related activities through information sharing
      and technical operations support to public safety personnel.`
    }
  ],
  'Automated License Plate Reader Systems': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `Automated License Plate Reader (ALPR) technology assists law
      enforcement by automating previously manual processes to improve efficiency,
      effectiveness, officer safety, accountability, and remove the potential for bias.`
    },
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `Upon encountering a license plate, optical sensors record a photograph,
      along with the current timestamp and location. The photograph is examined through Optical
      Character Recognition to determine the license plate number. Depending upon the configuration
      of the ALPR technology, the plate number may be compared with a "hotlist" of vehicles of
      interest, such as Stolen Vehicles or Stolen License Plates, and an alert may trigger when a
      match is found.`
    }
  ],
  'NCRIC Role in ALPR Collaboration': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `To support authorized law enforcement and public safety purposes of local,
      state, federal, and tribal public safety agencies, the NCRIC operates ALPR devices and
      provides a data sharing platform for multi-agency collaboration of ALPR information, to
      facilitate the rapid identification and location of vehicles of legitimate interest to
      law enforcement.`
    }
  ],
  Purpose: [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `This NCRIC Automated License Plate Reader Policy (ALPR Policy) defines
      a minimum set of binding guidelines to govern the use of Automated License Plate Reader
      Data (ALPR Data), in order to enable the collection and use of such data in a manner
      consistent with respect for individuals' privacy and civil liberties.`
    },
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `The NCRIC also completed a NCRIC ALPR Privacy Impact Assessment (PIA) to
      address in further detail common privacy and civil liberties concerns regarding Automated
      License Plate Reader technology. The current version of this document is available on the
      NCRIC web site at www.ncric.org.`
    }
  ],
  'Authorized Purposes, Collection, and Use of ALPR Data': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `To support the mission of the NCRIC, law enforcement personnel with a need
      and right to know will utilize ALPR technology to:`
    },
    {
      [FIELDS.TYPE]: CONTENT_TYPES.BULLET,
      [FIELDS.VALUE]: [
        'Locate stolen, wanted, and subject of investigation vehicles;',
        'Locate and apprehend individuals subject to arrest warrants or otherwise lawfully sought by law enforcement;',
        'Locate witnesses and victims of violent crime;',
        'Locate missing persons, including responding to Amber and Silver Alerts;',
        `Support local, state, federal, and tribal public safety departments in the identification of vehicles
        associated with targets of criminal investigations, including investigations of serial crimes;`,
        'Protect participants at special events; and',
        'Protect critical infrastructure sites.'
      ]
    },
  ],
  'Restrictions on Collection of ALPR Data and Use of ALPR Systems': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `ALPR may be used to collect data that is within public view, but may not be used for
      the sole purpose of monitoring individual activities protected by the First Amendment to the United
      States Constitution.`
    },
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `In accordance with the California Values Act, ALPR data may not be used for the
      purposes or immigration enforcement, or any similar duties.`
    },
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `ALPR operators must recognize that the data collected from the ALPR device, and
      the content of referenced hotlists, consists of data that may or may not be accurate, despite
      ongoing efforts to maximize the currency and accuracy of such data. Users of ALPR Data must, to
      the fullest extent possible, visually confirm the plate characters generated by the ALPR readers
      correspond with the digital image of the license plate in question.`
    },
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `In no case shall the NCRIC ALPR system be used for any purpose other than a legitimate
      law enforcement or public safety purpose.`
    },
  ],
  Audit: [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `Access to, and use of, ALPR Data is logged for audit purposes. Audit reports will be
      structured in a format that is understandable and useful and will contain, at a minimum:`
    },
    {
      [FIELDS.TYPE]: CONTENT_TYPES.BULLET,
      [FIELDS.VALUE]: [
        'The name of the law enforcement user;',
        'The name of the agency employing the user;',
        'The date and time of access;',
        'The specific data query submitted;',
        'The supplied authorized law enforcement or public safety justification for access; and',
        'A case number associated with the investigative effort generating the ALPR data query.'
      ]
    },
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `Audit reports will be provided periodically and on request to supervisory personnel
      at the NCRIC and partner agencies.`
    }
  ],
  'Retention and Sharing of ALPR Data': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `ALPR Data obtained with license plate information not appearing on hotlists, and with
      no immediate reasonable connection to criminal activity, will be securely retained and only made
      accessible to authorized personnel for a maximum period of 365 days, then purged entirely.`
    },
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `If during the specified retention period there is information which supports a legitimate
      law enforcement purpose (see above section enumerating AUTHORIZED PURPOSES, COLLECTION, AND USE OF ALPR DATA),
      then limited access will be permitted for predicate-based querying for potential matches against the parameters
      specific to the legitimate law enforcement purpose. All such events shall be recorded in an access log (see
      above AUDIT section) showing date, time, name of person seeking access, agency of employment, reason for access,
      and tracking identifiers such as an agency case number.`
    }
  ],
  'Not for Public Disclosure': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `It is the position of the NCRIC that ALPR data is not subject to public disclosure, such as
      through a Public Records Act or similar request. As reaffirmed in ACLU of Southern California vs the Los Angeles
      Police Department and Los Angeles Sheriff’s Department, ALPR data is exempt from public disclosure under CPRA
      pursuant to Government Code 6255(a); the potential danger in releasing the data outweighs the good in making it
      available.`
    }
  ],
  'Data Quality and Accuracy': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `The NCRIC makes no guarantee as to the accuracy of the information contained in the ALPR system.
      All records and associated metadata - including but not limited to license plate numbers, images, locations, and
      timestamps – are presented as originally provided by the originating source.`
    }
  ],
  'Custodian of Records and Records Requests': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `Each agency sharing data retains ownership as the official custodian of its records. To the extent
      permitted by law, requests for information under the California Public Records Act or Freedom of Information Act
      or similar applicable laws will be directed back to the owner of the requested data.`
    }
  ],
  'System Management and Accountability': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `The NCRIC shall assign a senior officer who will have responsibility, and be accountable, for
      managing the ALPR Data collected and ensuring that the privacy and civil liberties protection and other provisions
      of this ALPR Policy are carried out. This individual shall also be responsible for managing a process for maintaining
      the most current and accurate hotlists available from NCRIC law enforcement sources. This individual shall also have
      the responsibility for the security of the hotlist information and any ALPR Data which is maintained by the NCRIC.
      It remains, however, the personal responsibility of all officers with access to ALPR Data to take reasonable measures
      to protect the privacy and civil liberties of individuals, as well as the security and confidentiality of ALPR Data.`
    },
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `The NCRIC assumes no responsibility or liability for the acts or omissions of other agencies in making
      use of the ALPR data properly disseminated.`
    }
  ],
  Dissemination: [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `The NCRIC may disseminate ALPR data to any governmental entity with an authorized law enforcement or
      public safety purpose for access to such data. Information collected by the ALPR system shall not be disseminated to
      private parties, other than critical infrastructure owners or operators in circumstances where such infrastructure is
      reasonably believed to be the target of surveillance for the purpose of a terrorist attack or other criminal activity.
      ALPR information shall not be disseminated for personal gain or for any other non-law enforcement purposes.`
    }
  ],
  'Policy Revisions': [
    {
      [FIELDS.TYPE]: CONTENT_TYPES.TEXT,
      [FIELDS.VALUE]: `NCRIC ALPR Policies will be reviewed, and updated as necessary, no less frequently than every 12
      months, or more frequently based on changes in data sources, technology, data use and/or sharing agreements, and
      other relevant considerations.`
    }
  ]
};
