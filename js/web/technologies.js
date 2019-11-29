/*
 * **************************************************************************************
 *
 * Dateiname:                 technologies.js
 * Projekt:                   foe
 *
 * erstellt von:              Daniel Siekiera <daniel.siekiera@gmail.com>
 * zu letzt bearbeitet:       19.11.19, 14:38 Uhr
 *
 * Copyright © 2019
 *
 * **************************************************************************************
 */

let Technologies = {
    AllTechnologies: null,
    UnlockedTechologies: false,
    SelectedEraID: undefined, 
       
    Eras: {
        StoneAge: 1,
        BronzeAge: 2,
        IronAge: 3,
        EarlyMiddleAge: 4,
        HighMiddleAge: 5,
        LateMiddleAge: 6,
        ColonialAge: 7,
        IndustrialAge: 8,
        ProgressiveEra: 9,
        ModernEra: 10,
        PostModernEra: 11,
        ContemporaryEra: 12,
        TomorrowEra: 13,
        FutureEra: 14,
        ArcticFuture: 15,
        OceanicFuture: 16,
        VirtualFuture: 17,
        SpaceAgeMars: 18
    },
      
    Show: () => {
       if ($('#technologies').length === 0) {
            let args = {
                'id': 'technologies',
                'title': i18n['Boxes']['Technologies']['Title'],
                'auto_close': true,
                'dragdrop': true,
                'minimize': true
            };

           HTML.Box(args);
           Technologies.SelectedEraID = CurrentEraID;
        }

        Technologies.BuildBox();
    },

    BuildBox: () => {
        Technologies.CalcBody();

        // Zeitalter vor und zurück schalten
        $('body').on('click', '.btn-switchage', function () {

            $('.btn-switchage').removeClass('btn-default-active');

            Technologies.SelectedEraID = $(this).data('value');
            Technologies.CalcBody();

            $(this).addClass('btn-default-active');
        });
    },

    CalcBody: () => {
        let h = [],
            TechDict = [];

        // Index aufbauen (Namen => Index)
        for (let i = 1; i < Technologies.AllTechnologies.length; i++) {
            TechDict[Technologies.AllTechnologies[i]['id']] = i;
        }

        // Suche erforschte Technologien
        for (let i = 0; i < Technologies.UnlockedTechologies['unlockedTechnologies'].length; i++) {
            let TechName = Technologies.UnlockedTechologies['unlockedTechnologies'][i];
            let Index = TechDict[TechName];
            Technologies.AllTechnologies[Index]['isResearched'] = true;
            Technologies.AllTechnologies[Index]['currentSP'] = Technologies.AllTechnologies[Index]['maxSP'];
        }

        // Teilweise erforscht
        for (let i = 0; i < Technologies.UnlockedTechologies['inProgressTechnologies'].length; i++) {
            let InProgTech = Technologies.UnlockedTechologies['inProgressTechnologies'][i];
            let Index = TechDict[InProgTech['tech_id']];
            Technologies.AllTechnologies[Index]['currentSP'] = InProgTech['currentSP'];
        }

        // Gueter zaehlen
        let RequiredResources = [];
        for (let i = 1; i < Technologies.AllTechnologies.length; i++) {
            let Tech = Technologies.AllTechnologies[i];
            if (Tech['currentSP'] === undefined) Tech['currentSP'] = 0;

            if (!Tech['isResearched']) {
                let EraID = Technologies.Eras[Tech['era']];

                if (EraID <= Technologies.SelectedEraID && Tech['childTechnologies'].length > 0) {
                    if (RequiredResources['strategy_points'] === undefined) RequiredResources['strategy_points'] = 0;
                    RequiredResources['strategy_points'] += Tech['maxSP'] - Tech['currentSP'];
                    for (let ResourceName in Tech['requirements']['resources']) {
                        if (RequiredResources[ResourceName] === undefined) RequiredResources[ResourceName] = 0;
                        RequiredResources[ResourceName] += Tech['requirements']['resources'][ResourceName];
                    }
                }
            }
        }

        let PreviousEraID = Math.max(Technologies.SelectedEraID - 1, CurrentEraID),
            NextEraID = Math.min(Technologies.SelectedEraID + 1, Technologies.Eras['SpaceAgeMars']);

        h.push('<table>');
        h.push('<tr>');
        h.push('<td><button class="btn btn-default btn-switchage" data-value="' + PreviousEraID + '">' + i18n['Boxes']['Technologies']['Eras'][PreviousEraID] + '</button></td>');
        h.push('<td class="text-center"><strong>' + i18n['Boxes']['Technologies']['Eras'][Technologies.SelectedEraID] + '</strong></td>');
        h.push('<td><button class="btn btn-default btn-switchage" data-value="' + NextEraID + '">' + i18n['Boxes']['Technologies']['Eras'][NextEraID] + '</button></td>');
        h.push('<td></td>');
        h.push('</tr>');
        h.push('</table>');

        h.push('<table id="costTable" class="foe-table">');

        h.push('<thead>' +
            '<tr>' +
            '<th>' + i18n['Boxes']['Technologies']['Resource'] + '</th>' +
            '<th>' + i18n['Boxes']['Technologies']['DescRequired'] + '</th>' +
            '<th>' + i18n['Boxes']['Technologies']['DescInStock'] + '</th>' +
            '<th>' + i18n['Boxes']['Technologies']['DescStillMissing'] + '</th>' +
            '</tr>' +
            '</thead>');

        // Reihenfolge der Ausgabe generieren
        let OutputList = ['strategy_points', 'money', 'supplies'];
        for (let i = 0; i < 70; i++) {
            OutputList[OutputList.length] = GoodsList[i]['id'];
        }
        OutputList[OutputList.length] = 'promethium';
        for (let i = 70; i < 75; i++) {
            OutputList[OutputList.length] = GoodsList[i]['id'];
        }
        OutputList[OutputList.length] = 'orichalcum';
        for (let i = 75; i < GoodsList.length; i++) {
            OutputList[OutputList.length] = GoodsList[i]['id'];
        }

        for (let i = 0; i < OutputList.length; i++) {
            let ResourceName = OutputList[i];
            if (RequiredResources[ResourceName] !== undefined) {
                let Required = RequiredResources[ResourceName];
                let Stock = (ResourceName === 'strategy_points' ? StrategyPoints.AvailableFP : ResourceStock[ResourceName]);
                if (Stock === undefined) Stock = 0;
                let Diff = Stock - Required;

                h.push('<tr>');
                h.push('<td>' + GoodsNames[ResourceName] + '</td>');
                h.push('<td>' + HTML.Format(Required) + '</td>');
                h.push('<td>' + HTML.Format(Stock) + '</td>');
                h.push('<td class="text-center text-' + (Diff < 0 ? 'danger' : 'success') + '">' + HTML.Format(Diff) + '</td>');
                h.push('</tr>');
            }
        }
        h.push('</table');

        $('#technologiesBody').html(h.join(''));
    }
};