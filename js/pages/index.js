var jsonPet_list = null;
var jsonPet_affiliation = null;

var level_bonus = 0;
var percen_bonus = 0;
var tame_chance = 0.0;
var cards_used = 0;
var cards_wasted = 0;
var cards_tamed = 0;
var success_rate = 0.0;

//Esto se usa para leer archivos desde JQuery:
var files;
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
var fs = null;

// https://craftpip.github.io/jquery-confirm

function Iniciar() {
    try {
        $.ajax({
            url: 'data/creature_table_simple.bin',
            async: false,
            success: function (data) {
                var dec = window.atob(data);
                jsonPet_list = JSON.parse(dec);
            }
        });

        //Carga los Nombres de los Pets:
        $.getJSON('data/affiliation_table.json', function (data) {
            jsonPet_affiliation = data;

            if (typeof jsonPet_affiliation !== "undefined" && jsonPet_affiliation !== null) {
                //Carga la Lista de Pets en un Combo:
                var ListVar = $("#cboCreatureAffiliation");
                ListVar.empty();
                ListVar.append('<option></option>'); //<- Primera Opcion del Menu Vacia

                jsonPet_affiliation.forEach(function (_pet) {
                    var opt = $("<option>" + _pet.affiliation + "</option>").attr("value", _pet.affiliation_id);
                    ListVar.append(opt);
                });

                ListVar.selectmenu().selectmenu('refresh', true);
                ListVar.val(12).change();
            }
        });

    } catch (e) {
        console.log(e);
    }

    // Obtiene los Valores Iniciales del Tamaño de la Ventana
    var winWidth = $(window).width();
    var winHeight = $(window).height() - 50;


    /******** AQUI SE ENLAZAN LOS EVENTOS DE LOS CONTROLES ***********/

    $("#sliderRudra").change(function () {
        var _state = $('#sliderRudra').is(':checked');
        //console.log(_state);

        if (_state === true) {
            $('#cboRing2').val('0').change();
        }
        Calcular_BounsLevel();
    });
    $("#sliderRing2").change(function () {
        /*var _state = $('#sliderRing2').is(':checked');        
        if(_state === true){
            $('#sliderRudra').prop('checked', false); 
        }
        else {
            $('#sliderRudra').prop('checked', true);           
        }
        $('#sliderRudra').flipswitch('refresh');*/
    });

    $("#cboRing1").bind("change", function (event, ui) {
        Calcular_BounsLevel();
    });
    $("#cboRing2").bind("change", function (event, ui) {
        var _hasRing2 = parseInt($("#cboRing2").val());
        var _hasRudra = $('#sliderRudra').is(':checked');

        if (_hasRudra === true && _hasRing2 > 0) {
            $('#cboRing2').val('0');

            var _log = $('#divLog').html();
            _log += '<p><font color="red">Cant Equip This Ring while Rudra Set is on!</font></p>'
            $('#divLog').html(_log);
        }
        Calcular_BounsLevel();
    });

    $("#sliderEmblem").bind("change", function (event, ui) {
        Calcular_BounsLevel();
    });
    $("#sliderGlasses").bind("change", function (event, ui) {
        Calcular_BounsLevel();
    });
    $("#sliderSword").bind("change", function (event, ui) {
        Calcular_BounsLevel();
    });

    $("#cboCTC_level").bind("change", function (event, ui) {
        Calcular_BounsLevel();
    });
    $("#cboCTC_plus").bind("change", function (event, ui) {
        Calcular_BounsLevel();
    });

    $("#cboCreatureAffiliation").bind("change", function (event, ui) {
        var _affiliation = $("#cboCreatureAffiliation").val();
        //console.log(_affiliation);

        if (typeof jsonPet_list !== "undefined" && jsonPet_list !== null) {

            //Filtrar Todas las Pets con la Afiliacion seleccionada:
            var _pets = jsonPet_list.filter(word => word.affiliation_id == _affiliation);
            if (typeof _pets !== "undefined" && _pets !== null) {

                //Carga la Lista de Pets en un Combo:
                var ListVar = $("#cboPetList");
                ListVar.empty();
                ListVar.append('<option></option>'); //<- Primera Opcion del Menu Vacia

                _pets.forEach(function (_pet) {
                    //console.log(_pet);
                    _pet.species = _pet.species.replace('<', '(');
                    _pet.species = _pet.species.replace('>', ')');

                    var opt = $("<option>" + _pet.species + "</option>").attr("value", _pet.tame_rate);
                    ListVar.append(opt);
                });
                ListVar.selectmenu().selectmenu('refresh', true);
            }
        }
    });
    $("#cboPetList").bind("change", function (event, ui) {
        cards_used = 0;
        cards_wasted = 0;
        cards_tamed = 0;
        success_rate = 0.0;

        $('#divLog').html('');
        $('#txtCardsUsed').val(cards_used);
        $('#txtCardsWasted').val(cards_wasted);
        $('#txtCardsTamed').val(cards_tamed);
        $('#txtSuccesRate').val(success_rate);
        Calcular_BounsLevel();
    });

    $(document).on("click", "#cmdTame", function (evt) {
        Calcular_BounsLevel();

        var _luck = Math.floor(Math.random() * 1000001);
        var _log = $('#divLog').html();
        cards_used++;

        console.log(parseInt(tame_chance) + ' / ' + _luck);

        if (_luck <= tame_chance) {
            cards_tamed++;
            _log += '<p>Try ' + cards_used + ': <font color="yellow">Tame Succesful!</font></p>';
        } else {
            cards_wasted++;
            _log += '<p>Try ' + cards_used + ': Tame Failed!</p>';
        }

        success_rate = (cards_tamed * 100.0) / cards_used;

        $('#divLog').html(_log);
        $('#txtCardsUsed').val(cards_used);
        $('#txtCardsWasted').val(cards_wasted);
        $('#txtCardsTamed').val(cards_tamed);
        $('#txtSuccesRate').val(success_rate.toFixed(2) + '%');
    });

    $(document).on("click", "#cmdInfo", function (evt) {
        console.log('info');
    });
    $(document).on("click", "#cmdIniciarSesion", function (evt) {
        window.location.reload(); //<- Fuerza la recarga de la pagina.
    });

}

function Calcular_BounsLevel() {
    try {
        var _petChance = parseFloat($("#cboPetList").val());
        var _Tamelevel = parseInt($("#cboCTC_level").val());
        var _CTCplus = parseInt($("#cboCTC_plus").val());

        var _hasRudra = $('#sliderRudra').is(':checked');
        var _hasRing1 = parseInt($("#cboRing1").val());
        var _hasRing2 = parseInt($("#cboRing2").val());

        var _Emblem = $('#sliderEmblem').is(':checked');
        var _Glasses = $('#sliderGlasses').is(':checked');
        var _Sword170 = $('#sliderSword').is(':checked');

        var _rudraLvl = 0;
        var _EmblemLvl = 0;
        var _GlassesLvl = 0;
        var _SwordLvl = 0;

        if (_hasRudra === true) {
            _rudraLvl = 3;
        }
        if (_Emblem === true) {
            _EmblemLvl = 10000;
        }
        if (_Glasses === true) {
            _GlassesLvl = 10000;
        }
        if (_Sword170 === true) {
            _SwordLvl = 10000;
        }

        level_bonus = _hasRing1 + _hasRing2 + _rudraLvl;
        percen_bonus = _EmblemLvl + _GlassesLvl + _SwordLvl;
        tame_chance = (_petChance * 0.06 * ((_Tamelevel + level_bonus) + 0.03 * _CTCplus + 1) * 100) * 10000;
        tame_chance += _EmblemLvl + _GlassesLvl + _SwordLvl;

        $('#txtBonusLevel').val('+' + level_bonus);
        $('#txtBonusPercen').val('+' + percen_bonus / 10000 + '%');

        $('#txtChance').val('You have ' + ((tame_chance / 1000000) * 100).toFixed(3) + '% chances');

    } catch (e) {
        console.log(e);
    }
}


/******* AQUI VAN OTRAS FUNCIONES COMPLEMENTARIAS ***************/
function showPopUp(ShowBoss, CanChoose) {
    _state = ShowBoss;
    //console.log(CanChoose);
    if (CanChoose == true) {
        $('#BeggersArentChoosers').show();
    } else {
        $('#BeggersArentChoosers').hide();
    }

    if (ShowBoss == true) {
        $('#grpPet').hide();
        $('#grpBoss').show();

        $('#flipPetBossGrps').prop("checked", true).flipswitch("refresh");
    } else {
        $('#grpPet').show();
        $('#grpBoss').hide();

        $('#flipPetBossGrps').prop("checked", false).flipswitch("refresh");
    }
    $("#myPopup").popup("open", {
        positionTo: 'window',
        transition: "flip"
    });
    $('#cboPetChoose').focus();
}

function hidePopUp() {
    $("#myPopup").popup("close");
    $("#contenido").show();
}

function ShowLoading(pText) {
    var interval = setInterval(function () {
        $.mobile.loading("show", {
            textonly: "true",
            text: pText,
            textVisible: true,
            theme: "a",
            html: ""
        });
        clearInterval(interval);
    }, 1);
}

function HideLoading() {
    var interval = setInterval(function () {
        $.mobile.loading('hide');
        clearInterval(interval);
    }, 1);
}

function supports_html5_storage() {
    //Verifica el soperte del navegador para HTML5 y Local Storage
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}
