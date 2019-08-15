const factory_eeprom_data = [
0x00, 0x3e, 0x7f,										//Vendor
0x4e, 0x75, 0x45, 0x56, 0x49, 0x63,						//NuEVIc01
0x30, 0x31,												//Payload length
0x00, 0x66, 0x00, 0x20, 0x0a, 0x78, 0x1f, 0x20, 0x14, 0x28, 0x19, 0x64, 0x0a, 0x78, 0x11, 0x7c,
0x00, 0x0c, 0x00, 0x01, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x02,
0x00, 0x04, 0x00, 0x14, 0x09, 0x30, 0x12, 0x60, 0x00, 0x01, 0x00, 0x03, 0x00, 0x7d, 0x00, 0x04,
0x00, 0x0f, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, 0x00, 0x13, 0x00, 0x0e, 0x00, 0x11, 0x00, 0x0a,
0x00, 0x00, 0x00, 0x06, 0x00, 0x02, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x03,
0x00, 0x0a, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00,
0x3d, 0x39, 0x29, 0x68 ];								//CRC32 & 0x7F7F7F7F

const nuevi_vendor = [ 0x00, 0x3e, 0x7f ];

//Addresses of all items in EEPROM data

const VERSION_ADDR = 0;
const BREATH_THR_ADDR = 2;
const BREATH_MAX_ADDR = 4;
const PORTAM_THR_ADDR = 6;
const PORTAM_MAX_ADDR = 8;
const PITCHB_THR_ADDR = 10;
const PITCHB_MAX_ADDR = 12;
const TRANSP_ADDR = 14;
const MIDI_ADDR = 16;
const BREATH_CC_ADDR = 18;
const BREATH_AT_ADDR = 20;
const VELOCITY_ADDR = 22;
const PORTAM_ADDR = 24;
const PB_ADDR = 26;
const EXTRA_ADDR = 28;
const VIBRATO_ADDR = 30;
const DEGLITCH_ADDR = 32;
const EXTRAC_THR_ADDR = 34;
const EXTRAC_MAX_ADDR = 36;
const PATCH_ADDR = 38;
const OCTAVE_ADDR = 40;
const CTOUCH_THR_ADDR = 42;
const BREATHCURVE_ADDR = 44;
const VEL_SMP_DL_ADDR = 46;
const VEL_BIAS_ADDR = 48;
const PINKY_KEY_ADDR = 50;
const FP1_ADDR = 52;
const FP2_ADDR = 54;
const FP3_ADDR = 56;
const FP4_ADDR = 58;
const FP5_ADDR = 60;
const FP6_ADDR = 62;
const FP7_ADDR = 64;
const DIPSW_BITS_ADDR = 66;
const PARAL_ADDR = 68;
const ROTN1_ADDR = 70;
const ROTN2_ADDR = 72;
const ROTN3_ADDR = 74;
const ROTN4_ADDR = 76;
const PRIO_ADDR = 78;
const VIB_SENS_ADDR = 80;
const VIB_RETN_ADDR = 82;
const VIB_SQUELCH_ADDR = 84;
const VIB_DIRECTION_ADDR = 86;
const BREATH_CC2_ADDR = 88;
const BREATH_CC2_RISE_ADDR = 90;
const VIB_SENS_BITE_ADDR = 92;
const VIB_SQUELCH_BITE_ADDR = 94;
const VIB_CONTROL_ADDR = 96;
const TRILL3_INTERVAL_ADDR = 98;
const DAC_MODE_ADDR = 100;

const EEPROM_SIZE = 102;
const EEPROM_VERSION = 32;

const DIPSW_FASTBOOT = 0;
const DIPSW_LEGACY  =1 ;
const DIPSW_LEGACYBRACT = 2;
const DIPSW_SLOWMIDI =3;
const DIPSW_GATEOPEN = 4;
const DIPSW_SPKEYENABLE = 5;
const DIPSW_BCASMODE = 6;


function midi14to16(mididata) {
	return mididata[0]<<7 | mididata[1];
}

function readSetting(mididata, pos) {
	return midi14to16(mididata.slice(pos, pos+2));
}

function midi16to14(value) {
	msb = (value & 0x3F80) >> 7;
	lsb = (value & 0x007F);
	return [msb, lsb];
}

function storeSetting(buffer, position, value) {
	[msb, lsb] = midi16to14(value);
	buffer[position] = msb;
	buffer[position+1] = lsb;
}

function equalArray(a1, a2) {
	if(a1.length != a2.length) return false;

	for(i=0; i<a1.length; ++i) {
		if(a1[i] != a2[i]) return false;
	}

	return true;
}

function updateBitfield(nc) {
	nc.dipSwBits =  (nc.fastBoot   &1)<<DIPSW_FASTBOOT    |
				    (nc.legacyPB   &1)<<DIPSW_LEGACY      |
					(nc.legacyBR   &1)<<DIPSW_LEGACYBRACT |
					(nc.slowMidi   &1)<<DIPSW_SLOWMIDI    |
					(nc.gateOpen   &1)<<DIPSW_GATEOPEN    |
					(nc.specialKey &1)<<DIPSW_SPKEYENABLE |
					(nc.bcasMode   &1)<<DIPSW_BCASMODE ;
}


function readConfig(mididata) {
	var nueviConfig = new Object();

	nueviConfig.version      = readSetting(mididata, VERSION_ADDR);
	nueviConfig.adjustBreath = [readSetting(mididata, BREATH_THR_ADDR), readSetting(mididata, BREATH_MAX_ADDR)];
	nueviConfig.adjustPorta  = [readSetting(mididata, PORTAM_THR_ADDR), readSetting(mididata, PORTAM_MAX_ADDR)];
	nueviConfig.adjustPitchB = [readSetting(mididata, PITCHB_THR_ADDR), readSetting(mididata, PITCHB_MAX_ADDR)];
	nueviConfig.adjustExtraC = [readSetting(mididata, EXTRAC_THR_ADDR), readSetting(mididata, EXTRAC_MAX_ADDR)];
	
	nueviConfig.transpose    = readSetting(mididata, TRANSP_ADDR);
	nueviConfig.MIDIchannel  = readSetting(mididata, MIDI_ADDR);
	nueviConfig.breathCC     = readSetting(mididata, BREATH_CC_ADDR);
	nueviConfig.breathAT     = readSetting(mididata, BREATH_AT_ADDR);
	nueviConfig.velocity     = readSetting(mididata, VELOCITY_ADDR);
	nueviConfig.portamento   = readSetting(mididata, PORTAM_ADDR);
	nueviConfig.PBdepth      = readSetting(mididata, PB_ADDR);
	nueviConfig.extraCT      = readSetting(mididata, EXTRA_ADDR);
	nueviConfig.deglitch     = readSetting(mididata, DEGLITCH_ADDR);

	nueviConfig.patch        = readSetting(mididata, PATCH_ADDR);
	nueviConfig.octave       = readSetting(mididata, OCTAVE_ADDR);
	nueviConfig.ctouchThrVal = readSetting(mididata, CTOUCH_THR_ADDR);
	nueviConfig.curve        = readSetting(mididata, BREATHCURVE_ADDR);
	nueviConfig.velSmpDl     = readSetting(mididata, VEL_SMP_DL_ADDR);
	nueviConfig.velBias      = readSetting(mididata, VEL_BIAS_ADDR);
	nueviConfig.pinkySetting = readSetting(mididata, PINKY_KEY_ADDR);

	nueviConfig.fastPatch    = [readSetting(mididata, FP1_ADDR),
								readSetting(mididata, FP2_ADDR),
								readSetting(mididata, FP3_ADDR),
								readSetting(mididata, FP4_ADDR),
								readSetting(mididata, FP5_ADDR),
								readSetting(mididata, FP6_ADDR),
								readSetting(mididata, FP7_ADDR)];

	nueviConfig.dipSwBits    = readSetting(mididata, DIPSW_BITS_ADDR);
	nueviConfig.parallel     = readSetting(mididata, PARAL_ADDR);

	nueviConfig.rotations    = [readSetting(mididata, ROTN1_ADDR),
								readSetting(mididata, ROTN2_ADDR),
								readSetting(mididata, ROTN3_ADDR),
								readSetting(mididata, ROTN4_ADDR)];
								
	nueviConfig.priority     = readSetting(mididata, PRIO_ADDR);
	
	nueviConfig.vibratoControl 		= readSetting(mididata, VIB_CONTROL_ADDR);
	nueviConfig.vibratoDepth 		= readSetting(mididata, VIBRATO_ADDR);
	nueviConfig.vibratoReturn      	= readSetting(mididata, VIB_RETN_ADDR);
	nueviConfig.vibratoSenseLever   = readSetting(mididata, VIB_SENS_ADDR);
	nueviConfig.vibratoSquelchLever = readSetting(mididata, VIB_SQUELCH_ADDR);
	nueviConfig.vibratoSenseBite  	= readSetting(mididata, VIB_SENS_BITE_ADDR);
	nueviConfig.vibratoSquelcBite   = readSetting(mididata, VIB_SQUELCH_BITE_ADDR);
	nueviConfig.vibratoDirection 	= readSetting(mididata, VIB_DIRECTION_ADDR);

	nueviConfig.breathCC2     	= readSetting(mididata, BREATH_CC2_ADDR);
	nueviConfig.breathCC2rise   = readSetting(mididata, BREATH_CC2_RISE_ADDR);
	nueviConfig.trill3interval 	= readSetting(mididata, TRILL3_INTERVAL_ADDR);
	nueviConfig.dacMode 		= readSetting(mididata, DAC_MODE_ADDR);


	nueviConfig.fastBoot         = (nueviConfig.dipSwBits & (1<<DIPSW_FASTBOOT))?1:0;
	nueviConfig.legacyPB         = (nueviConfig.dipSwBits & (1<<DIPSW_LEGACY))?1:0;
	nueviConfig.legacyBR         = (nueviConfig.dipSwBits & (1<<DIPSW_LEGACYBRACT))?1:0;
	nueviConfig.slowMidi         = (nueviConfig.dipSwBits & (1<<DIPSW_SLOWMIDI))?1:0;
	nueviConfig.gateOpen         = (nueviConfig.dipSwBits & (1<<DIPSW_GATEOPEN))?1:0;
	nueviConfig.specialKey       = (nueviConfig.dipSwBits & (1<<DIPSW_SPKEYENABLE))?1:0;
	nueviConfig.bcasMode         = (nueviConfig.dipSwBits & (1<<DIPSW_BCASMODE))?1:0;

	return nueviConfig;
}

function dumpConfig(nc) {
	updateBitfield(nc);
	var buf = new Uint8Array(EEPROM_SIZE);


	storeSetting(buf, VERSION_ADDR, 	nc.version);
	storeSetting(buf, BREATH_THR_ADDR,	nc.adjustBreath[0]);
	storeSetting(buf, BREATH_MAX_ADDR,	nc.adjustBreath[1]);
	storeSetting(buf, PORTAM_THR_ADDR,	nc.adjustPorta[0],);
	storeSetting(buf, PORTAM_MAX_ADDR,	nc.adjustPorta[1],);
	storeSetting(buf, PITCHB_THR_ADDR,	nc.adjustPitchB[0]);
	storeSetting(buf, PITCHB_MAX_ADDR,	nc.adjustPitchB[1]);
	storeSetting(buf, EXTRAC_THR_ADDR,	nc.adjustExtraC[0]);
	storeSetting(buf, EXTRAC_MAX_ADDR,	nc.adjustExtraC[1]);

	storeSetting(buf, TRANSP_ADDR,		nc.transpose);
	storeSetting(buf, MIDI_ADDR,		nc.MIDIchannel);
	storeSetting(buf, BREATH_CC_ADDR,	nc.breathCC);
	storeSetting(buf, BREATH_AT_ADDR,	nc.breathAT);
	storeSetting(buf, VELOCITY_ADDR,	nc.velocity);
	storeSetting(buf, PORTAM_ADDR,		nc.portamento);
	storeSetting(buf, PB_ADDR,			nc.PBdepth);
	storeSetting(buf, EXTRA_ADDR,		nc.extraCT);
	storeSetting(buf, DEGLITCH_ADDR,	nc.deglitch);

	storeSetting(buf, PATCH_ADDR,		nc.patch);
	storeSetting(buf, OCTAVE_ADDR,		nc.octave);
	storeSetting(buf, CTOUCH_THR_ADDR,	nc.ctouchThrVal);
	storeSetting(buf, BREATHCURVE_ADDR, nc.curve);
	storeSetting(buf, VEL_SMP_DL_ADDR,	nc.velSmpDl);
	storeSetting(buf, VEL_BIAS_ADDR,	nc.velBias);
	storeSetting(buf, PINKY_KEY_ADDR,	nc.pinkySetting);

	storeSetting(buf, FP1_ADDR, 		nc.fastPatch[0]);
	storeSetting(buf, FP2_ADDR,			nc.fastPatch[1]);
	storeSetting(buf, FP3_ADDR,			nc.fastPatch[2]);
	storeSetting(buf, FP4_ADDR,			nc.fastPatch[3]);
	storeSetting(buf, FP5_ADDR,			nc.fastPatch[4]);
	storeSetting(buf, FP6_ADDR,			nc.fastPatch[5]);
	storeSetting(buf, FP7_ADDR,			nc.fastPatch[6]);

	storeSetting(buf, DIPSW_BITS_ADDR,	nc.dipSwBits);
	storeSetting(buf, PARAL_ADDR,		nc.parallel);

	storeSetting(buf, ROTN1_ADDR,		nc.rotations[0]);
	storeSetting(buf, ROTN2_ADDR,		nc.rotations[1]);
	storeSetting(buf, ROTN3_ADDR,		nc.rotations[2]);
	storeSetting(buf, ROTN4_ADDR,		nc.rotations[3]);

	storeSetting(buf, PRIO_ADDR,		nc.priority);

	storeSetting(buf, VIB_CONTROL_ADDR,			nc.vibratoControl);
	storeSetting(buf, VIBRATO_ADDR,				nc.vibratoDepth);
	storeSetting(buf, VIB_RETN_ADDR,			nc.vibratoReturn);
	storeSetting(buf, VIB_SENS_ADDR,			nc.vibratoSenseLever);
	storeSetting(buf, VIB_SQUELCH_ADDR,			nc.vibratoSquelchLever);
	storeSetting(buf, VIB_SENS_BITE_ADDR,		nc.vibratoSenseBite);
	storeSetting(buf, VIB_SQUELCH_BITE_ADDR,	nc.vibratoSquelcBite);
	storeSetting(buf, VIB_DIRECTION_ADDR,		nc.vibratoDirection);

	storeSetting(buf, BREATH_CC2_ADDR, nc.breathCC2);
	storeSetting(buf, BREATH_CC2_RISE_ADDR, nc.breathCC2rise);
	storeSetting(buf, TRILL3_INTERVAL_ADDR, nc.trill3interval);
	storeSetting(buf, DAC_MODE_ADDR, nc.dacMode);

	return buf;
}


function parseSysex(data) {
	var vendor = data.slice(0,3);

	if(!equalArray(vendor, nuevi_vendor)) {
		console.log("Unknown vendor: " + vendor);
		return;
	}


	var header = data.slice(3,11).map(x => String.fromCharCode(x)).join("");

	if(header != "NuEVIc01") {
		console.log("Unknown header: '" + header + "'");
		return;
	}

	var payload_length = midi14to16(data.slice(11,13));

	if(payload_length != EEPROM_SIZE) {
		console.log("Payload expected to be 88 bytes, was " + payload_length + " bytes.");
		return;
	}

	if(data.length < 13+payload_length) {
		console.log("Data too short to fit payload, only " + data.length + " bytes found.");
		return;	
	}

	var payload = data.slice(13, 13+payload_length);
	var checksum = data.slice(-4);
	var checksum_data = data.slice(0, -4);
	
	crc = CRC32.buf(checksum_data);

	//Mask off msb of each byte to match 7-bit midi data format
	if(!equalArray(checksum, [ crc>>24 & 0x7f, crc>>16 & 0x7f, crc>>8 & 0x7f, crc & 0x7f])) {
		console.log("Checksum mismatch");
		return;
	}

	nc = readConfig(payload);
	//console.log(nc);


	if(nc.version != EEPROM_VERSION) {
		console.log("Unknown NuEVI config version: '" + nc.version + "'.");
	}
	
	return nc;

}



function sendSysexConfig(nc) {
	var configBuffer = dumpConfig(nc);

	var sysexBuffer = new Uint8Array(3+8+2+configBuffer.length+4);

	sysexBuffer.set(nuevi_vendor, 0); //Vendor
	var command="NuEVIc01".split("").map(c => c.charCodeAt(0)); //String to byte array
	sysexBuffer.set(command, 3); //Command
	sysexBuffer.set(midi16to14(configBuffer.length), 3+8); //Payload length
	sysexBuffer.set(configBuffer, 3+8+2); //Payload

		
	crc = CRC32.buf(sysexBuffer.slice(0, 3+8+2+configBuffer.length));
	crc_buf = [ crc>>24 & 0x7f, crc>>16 & 0x7f, crc>>8 & 0x7f, crc & 0x7f];

	sysexBuffer.set(crc_buf, 3+8+2+configBuffer.length); //CRC
	return sysexBuffer;
}


function sendSysexVersionRequest(outputDevice) {
	var sysexBuffer = new Uint8Array(13);
	sysexBuffer.set(0xF0, 0); //Sysex start marker
	sysexBuffer.set(nuevi_vendor, 1); //Vendor
	var command="NuEVIc03".split("").map(c => c.charCodeAt(0)); //String to byte array
	sysexBuffer.set(command, 4); //Command
	sysexBuffer.set(0xF7, 12); //Sysex end marker
	outputDevice.send(sysexBuffer);
}