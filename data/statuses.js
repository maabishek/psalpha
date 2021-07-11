"use strict";

/**@type {{[k: string]: EffectData}} */
let BattleStatuses = {
  brn: {
    name: "brn",
    effectType: "Status",
    onStart(target, source, sourceEffect) {
      if (sourceEffect && sourceEffect.id === "flameorb") {
        this.add("-status", target, "brn", "[from] item: Flame Orb");
      } else if (sourceEffect && sourceEffect.effectType === "Ability") {
        this.add(
          "-status",
          target,
          "brn",
          "[from] ability: " + sourceEffect.name,
          "[of] " + source
        );
      } else {
        this.add("-status", target, "brn");
      }
    },
    // Damage reduction is handled directly in the sim/battle.js damage function
    onResidualOrder: 10,
    onResidual(pokemon) {
      this.damage(pokemon.baseMaxhp / 16);
    }
  },
  par: {
    name: "par",
    effectType: "Status",
    onStart(target, source, sourceEffect) {
      if (sourceEffect && sourceEffect.effectType === "Ability") {
        this.add(
          "-status",
          target,
          "par",
          "[from] ability: " + sourceEffect.name,
          "[of] " + source
        );
      } else {
        this.add("-status", target, "par");
      }
    },
    onModifySpe(spe, pokemon) {
      if (!pokemon.hasAbility("quickfeet")) {
        return this.chainModify(0.5);
      }
    },
    onBeforeMovePriority: 1,
    onBeforeMove(pokemon) {
      if (this.randomChance(1, 4)) {
        this.add("cant", pokemon, "par");
        return false;
      }
    }
  },
  slp: {
    name: "slp",
    effectType: "Status",
    onStart(target, source, sourceEffect) {
      if (sourceEffect && sourceEffect.effectType === "Ability") {
        this.add(
          "-status",
          target,
          "slp",
          "[from] ability: " + sourceEffect.name,
          "[of] " + source
        );
      } else if (sourceEffect && sourceEffect.effectType === "Move") {
        this.add("-status", target, "slp", "[from] move: " + sourceEffect.name);
      } else {
        this.add("-status", target, "slp");
      }
      // 1-3 turns
      this.effectState.startTime = this.random(2, 5);
      this.effectState.time = this.effectState.startTime;
    },
    onBeforeMovePriority: 10,
    onBeforeMove(pokemon, target, move) {
      if (pokemon.hasAbility("earlybird")) {
        pokemon.statusState.time--;
      }
      pokemon.statusState.time--;
      if (pokemon.statusState.time <= 0) {
        pokemon.cureStatus();
        return;
      }
      this.add("cant", pokemon, "slp");
      if (move.sleepUsable) {
        return;
      }
      return false;
    }
  },
  frz: {
    name: "frz",
    effectType: "Status",
    onStart(target, source, sourceEffect) {
      if (sourceEffect && sourceEffect.effectType === "Ability") {
        this.add(
          "-status",
          target,
          "frz",
          "[from] ability: " + sourceEffect.name,
          "[of] " + source
        );
      } else {
        this.add("-status", target, "frz");
      }
      if (
        target.species.name === "Shaymin-Sky" &&
        target.baseSpecies.baseSpecies === "Shaymin"
      ) {
        target.formeChange("Shaymin", this.effect, true);
      }
    },
    onBeforeMovePriority: 10,
    onBeforeMove(pokemon, target, move) {
      if (move.flags["defrost"]) return;
      if (this.randomChance(1, 5)) {
        pokemon.cureStatus();
        return;
      }
      this.add("cant", pokemon, "frz");
      return false;
    },
    onModifyMove(move, pokemon) {
      if (move.flags["defrost"]) {
        this.add("-curestatus", pokemon, "frz", "[from] move: " + move);
        pokemon.setStatus("");
      }
    },
    onHit(target, source, move) {
      if (
        move.thawsTarget ||
        (move.type === "Fire" && move.category !== "Status")
      ) {
        target.cureStatus();
      }
    }
  },
  psn: {
    name: "psn",
    effectType: "Status",
    onStart(target, source, sourceEffect) {
      if (sourceEffect && sourceEffect.effectType === "Ability") {
        this.add(
          "-status",
          target,
          "psn",
          "[from] ability: " + sourceEffect.name,
          "[of] " + source
        );
      } else {
        this.add("-status", target, "psn");
      }
    },
    onResidualOrder: 9,
    onResidual(pokemon) {
      this.damage(pokemon.baseMaxhp / 8);
    }
  },
  tox: {
    name: "tox",
    effectType: "Status",
    onStart(target, source, sourceEffect) {
      this.effectState.stage = 0;
      if (sourceEffect && sourceEffect.id === "toxicorb") {
        this.add("-status", target, "tox", "[from] item: Toxic Orb");
      } else if (sourceEffect && sourceEffect.effectType === "Ability") {
        this.add(
          "-status",
          target,
          "tox",
          "[from] ability: " + sourceEffect.name,
          "[of] " + source
        );
      } else {
        this.add("-status", target, "tox");
      }
    },
    onSwitchIn() {
      this.effectState.stage = 0;
    },
    onResidualOrder: 9,
    onResidual(pokemon) {
      if (this.effectState.stage < 15) {
        this.effectState.stage++;
      }
      this.damage(
        this.clampIntRange(pokemon.baseMaxhp / 16, 1) * this.effectState.stage
      );
    }
  },
  weaknd: {
    name: "weaknd",
    effectType: "Status",
    onStart(target, source, sourceEffect) {
      if (sourceEffect && sourceEffect.id === "unrealorb") {
        this.add("-status", target, "brn", "[from] item: Unreal Orb");
      } else if (sourceEffect && sourceEffect.effectType === "Ability") {
        this.add(
          "-status",
          target,
          "weaknd",
          "[from] ability: " + sourceEffect.name,
          "[of] " + source
        );
      } else {
        this.add("-status", target, "weaknd");
      }
    },
    // Damage reduction is handled directly in the sim/battle.js damage function
    onResidualOrder: 10,
    onResidual(pokemon) {
      this.damage(pokemon.baseMaxhp / 16);
    }
  },
  confusion: {
    name: "confusion",
    id: "confusion",
    num: 0,
    // this is a volatile status
    onStart: function(target, source, sourceEffect) {
      if (sourceEffect && sourceEffect.id === "lockedmove") {
        this.add("-start", target, "confusion", "[fatigue]");
      } else {
        this.add("-start", target, "confusion");
      }
      this.effectData.time = this.random(2, 6);
    },
    onEnd: function(target) {
      this.add("-end", target, "confusion");
    },
    onBeforeMovePriority: 3,
    onBeforeMove: function(pokemon) {
      pokemon.volatiles.confusion.time--;
      if (!pokemon.volatiles.confusion.time) {
        pokemon.removeVolatile("confusion");
        return;
      }
      this.add("-activate", pokemon, "confusion");
      if (!this.randomChance(1, 3)) {
        return;
      }
      this.activeTarget = pokemon;
      this.damage(this.getDamage(pokemon, pokemon, 40), pokemon, pokemon, {
        id: "confused",
        effectType: "Move",
        // @ts-ignore
        type: "???"
      });
      return false;
    }
  },
  flinch: {
    name: "flinch",
    duration: 1,
    onBeforeMovePriority: 8,
    onBeforeMove(pokemon) {
      this.add("cant", pokemon, "flinch");
      this.runEvent("Flinch", pokemon);
      return false;
    }
  },
  trapped: {
    name: "trapped",
    noCopy: true,
    onTrapPokemon(pokemon) {
      pokemon.tryTrap();
    },
    onStart(target) {
      this.add("-activate", target, "trapped");
    }
  },
  trapper: {
    name: "trapper",
    noCopy: true
  },
  partiallytrapped: {
    name: "partiallytrapped",
    id: "partiallytrapped",
    num: 0,
    duration: 5,
    durationCallback: function(target, source) {
      if (source.hasItem("gripclaw")) return 8;
      return this.random(5, 7);
    },
    onStart: function(pokemon, source) {
      this.add(
        "-activate",
        pokemon,
        "move: " + this.effectData.sourceEffect,
        "[of] " + source
      );
    },
    onResidualOrder: 11,
    onResidual: function(pokemon) {
      if (
        this.effectData.source &&
        (!this.effectData.source.isActive ||
          this.effectData.source.hp <= 0 ||
          !this.effectData.source.activeTurns)
      ) {
        delete pokemon.volatiles["partiallytrapped"];
        return;
      }
      if (this.effectData.source.hasItem("bindingband")) {
        this.damage(pokemon.maxhp / 6);
      } else {
        this.damage(pokemon.maxhp / 8);
      }
    },
    onEnd: function(pokemon) {
      this.add(
        "-end",
        pokemon,
        this.effectData.sourceEffect,
        "[partiallytrapped]"
      );
    },
    onTrapPokemon: function(pokemon) {
      if (this.effectData.source && this.effectData.source.isActive)
        pokemon.tryTrap();
    }
  },
  lockedmove: {
    // Outrage, Thrash, Petal Dance...
    name: "lockedmove",
    duration: 2,
    onResidual(target) {
      if (target.status === "slp") {
        // don't lock, and bypass confusion for calming
        delete target.volatiles["lockedmove"];
      }
      this.effectState.trueDuration--;
    },
    onStart(target, source, effect) {
      this.effectState.trueDuration = this.random(2, 4);
      this.effectState.move = effect.id;
    },
    onRestart() {
      if (this.effectState.trueDuration >= 2) {
        this.effectState.duration = 2;
      }
    },
    onEnd(target) {
      if (this.effectState.trueDuration > 1) return;
      target.addVolatile("confusion");
    },
    onLockMove(pokemon) {
      if (pokemon.volatiles["dynamax"]) return;
      return this.effectState.move;
    }
  },
  twoturnmove: {
    // Skull Bash, SolarBeam, Sky Drop...
    name: "twoturnmove",
    id: "twoturnmove",
    num: 0,
    duration: 2,
    onStart: function(target, source, effect) {
      this.effectData.move = effect.id;
      target.addVolatile(effect.id, source);
    },
    onEnd: function(target) {
      target.removeVolatile(this.effectData.move);
    },
    onLockMove: function() {
      return this.effectData.move;
    },
    onMoveAborted: function(pokemon) {
      pokemon.removeVolatile("twoturnmove");
    }
  },
  choicelock: {
    name: "choicelock",
    noCopy: true,
    onStart(pokemon) {
      if (!this.activeMove) throw new Error("Battle.activeMove is null");
      if (
        !this.activeMove.id ||
        this.activeMove.hasBounced ||
        this.activeMove.sourceEffect === "snatch"
      )
        return false;
      this.effectState.move = this.activeMove.id;
    },
    onBeforeMove(pokemon, target, move) {
      if (!pokemon.getItem().isChoice) {
        pokemon.removeVolatile("choicelock");
        return;
      }
      if (
        !pokemon.ignoringItem() &&
        !pokemon.volatiles["dynamax"] &&
        move.id !== this.effectState.move &&
        move.id !== "struggle"
      ) {
        // Fails unless the Choice item is being ignored, and no PP is lost
        this.addMove("move", pokemon, move.name);
        this.attrLastMove("[still]");
        this.debug("Disabled by Choice item lock");
        this.add("-fail", pokemon);
        return false;
      }
    },
    onDisableMove(pokemon) {
      if (
        !pokemon.getItem().isChoice ||
        !pokemon.hasMove(this.effectState.move)
      ) {
        pokemon.removeVolatile("choicelock");
        return;
      }
      if (pokemon.ignoringItem() || pokemon.volatiles["dynamax"]) {
        return;
      }
      for (const moveSlot of pokemon.moveSlots) {
        if (moveSlot.id !== this.effectState.move) {
          pokemon.disableMove(
            moveSlot.id,
            false,
            this.effectState.sourceEffect
          );
        }
      }
    }
  },
  mustrecharge: {
    name: "mustrecharge",
    duration: 2,
    onBeforeMovePriority: 11,
    onBeforeMove(pokemon) {
      this.add("cant", pokemon, "recharge");
      pokemon.removeVolatile("mustrecharge");
      pokemon.removeVolatile("truant");
      return null;
    },
    onStart(pokemon) {
      this.add("-mustrecharge", pokemon);
    },
    onLockMove: "recharge"
  },
  futuremove: {
    // this is a side condition
    name: "futuremove",
    id: "futuremove",
    num: 0,
    onStart: function(side) {
      this.effectData.positions = [];
      for (let i = 0; i < side.active.length; i++) {
        this.effectData.positions[i] = null;
      }
    },
    onResidualOrder: 3,
    onResidual: function(side) {
      let finished = true;
      for (const [i, target] of side.active.entries()) {
        let posData = this.effectData.positions[i];
        if (!posData) continue;

        posData.duration--;

        if (posData.duration > 0) {
          finished = false;
          continue;
        }

        // time's up; time to hit! :D
        const move = this.getMove(posData.move);
        if (target.fainted || target === posData.source) {
          this.add(
            "-hint",
            "" +
              move.name +
              " did not hit because the target is " +
              (target.fainted ? "fainted" : "the user") +
              "."
          );
          this.effectData.positions[i] = null;
          continue;
        }

        this.add("-end", target, "move: " + move.name);
        target.removeVolatile("Protect");
        target.removeVolatile("Endure");

        if (posData.source.hasAbility("infiltrator") && this.gen >= 6) {
          posData.moveData.infiltrates = true;
        }
        const hitMove = new this.Data.Move(posData.moveData);

        this.tryMoveHit(target, posData.source, hitMove);

        this.effectData.positions[i] = null;
      }
      if (finished) {
        side.removeSideCondition("futuremove");
      }
    }
  },
  healreplacement: {
    // this is a slot condition
    name: "healreplacement",
    onStart(target, source, sourceEffect) {
      this.effectState.sourceEffect = sourceEffect;
      this.add("-activate", source, "healreplacement");
    },
    onSwitchInPriority: 1,
    onSwitchIn(target) {
      if (!target.fainted) {
        target.heal(target.maxhp);
        this.add(
          "-heal",
          target,
          target.getHealth,
          "[from] move: " + this.effectState.sourceEffect,
          "[zeffect]"
        );
        target.side.removeSlotCondition(target, "healreplacement");
      }
    }
  },
  stall: {
    // Protect, Detect, Endure counter
    name: "stall",
    id: "stall",
    num: 0,
    duration: 2,
    counterMax: 729,
    onStart: function() {
      this.effectData.counter = 3;
    },
    onStallMove: function(pokemon) {
      // this.effectData.counter should never be undefined here.
      // However, just in case, use 1 if it is undefined.
      let counter = this.effectData.counter || 1;
      this.debug("Success chance: " + Math.round(100 / counter) + "%");
      let success = this.randomChance(1, counter);
      if (!success) delete pokemon.volatiles["stall"];
      return success;
    },
    onRestart: function() {
      // @ts-ignore
      if (this.effectData.counter < this.effect.counterMax) {
        this.effectData.counter *= 3;
      }
      this.effectData.duration = 2;
    }
  },
  gem: {
    name: "gem",
    duration: 1,
    affectsFainted: true,
    onBasePowerPriority: 14,
    onBasePower(basePower, user, target, move) {
      this.debug("Gem Boost");
      return this.chainModify([5325, 4096]);
    }
  },

	// weather is implemented here since it's so important to the game

	raindance: {
		name: 'RainDance',
		id: 'raindance',
		num: 0,
		effectType: 'Weather',
		duration: 5,
		durationCallback: function (source, effect) {
			if (source && source.hasItem('damprock')) {
				return 8;
			}
			return 5;
		},
		onWeatherModifyDamage: function (damage, attacker, defender, move) {
			if (move.type === 'Water') {
				this.debug('rain water boost');
				return this.chainModify(1.5);
			}
			if (move.type === 'Fire') {
				this.debug('rain fire suppress');
				return this.chainModify(0.5);
			}
		},
		onStart: function (battle, source, effect) {
			if (effect && effect.effectType === 'Ability') {
				if (this.gen <= 5) this.effectData.duration = 0;
				this.add('-weather', 'RainDance', '[from] ability: ' + effect, '[of] ' + source);
			} else {
				this.add('-weather', 'RainDance');
			}
		},
		onResidualOrder: 1,
		onResidual: function () {
			this.add('-weather', 'RainDance', '[upkeep]');
			this.eachEvent('Weather');
		},
		onEnd: function () {
			this.add('-weather', 'none');
		},
	},
	primordialsea: {
		name: 'PrimordialSea',
		id: 'primordialsea',
		num: 0,
		effectType: 'Weather',
		duration: 0,
		onTryMove: function (target, source, effect) {
			if (effect.type === 'Fire' && effect.category !== 'Status') {
				this.debug('Primordial Sea fire suppress');
				this.add('-fail', source, effect, '[from] Primordial Sea');
				return null;
			}
		},
		onWeatherModifyDamage: function (damage, attacker, defender, move) {
			if (move.type === 'Water') {
				this.debug('Rain water boost');
				return this.chainModify(1.5);
			}
		},
		onStart: function (battle, source, effect) {
			this.add('-weather', 'PrimordialSea', '[from] ability: ' + effect, '[of] ' + source);
		},
		onResidualOrder: 1,
		onResidual: function () {
			this.add('-weather', 'PrimordialSea', '[upkeep]');
			this.eachEvent('Weather');
		},
		onEnd: function () {
			this.add('-weather', 'none');
		},
	},
	sunnyday: {
		name: 'SunnyDay',
		id: 'sunnyday',
		num: 0,
		effectType: 'Weather',
		duration: 5,
		durationCallback: function (source, effect) {
			if (source && source.hasItem('heatrock')) {
				return 8;
			}
			return 5;
		},
		onWeatherModifyDamage: function (damage, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Sunny Day fire boost');
				return this.chainModify(1.5);
			}
			if (move.type === 'Water') {
				this.debug('Sunny Day water suppress');
				return this.chainModify(0.5);
			}
		},
		onStart: function (battle, source, effect) {
			if (effect && effect.effectType === 'Ability') {
				if (this.gen <= 5) this.effectData.duration = 0;
				this.add('-weather', 'SunnyDay', '[from] ability: ' + effect, '[of] ' + source);
			} else {
				this.add('-weather', 'SunnyDay');
			}
		},
		onImmunity: function (type) {
			if (type === 'frz') return false;
		},
		onResidualOrder: 1,
		onResidual: function () {
			this.add('-weather', 'SunnyDay', '[upkeep]');
			this.eachEvent('Weather');
		},
		onEnd: function () {
			this.add('-weather', 'none');
		},
	},
	desolateland: {
		name: 'DesolateLand',
		id: 'desolateland',
		num: 0,
		effectType: 'Weather',
		duration: 0,
		onTryMove: function (target, source, effect) {
			if (effect.type === 'Water' && effect.category !== 'Status') {
				this.debug('Desolate Land water suppress');
				this.add('-fail', source, effect, '[from] Desolate Land');
				return null;
			}
		},
		onWeatherModifyDamage: function (damage, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Sunny Day fire boost');
				return this.chainModify(1.5);
			}
		},
		onStart: function (battle, source, effect) {
			this.add('-weather', 'DesolateLand', '[from] ability: ' + effect, '[of] ' + source);
		},
		onImmunity: function (type) {
			if (type === 'frz') return false;
		},
		onResidualOrder: 1,
		onResidual: function () {
			this.add('-weather', 'DesolateLand', '[upkeep]');
			this.eachEvent('Weather');
		},
		onEnd: function () {
			this.add('-weather', 'none');
		},
	},
	sandstorm: {
		name: 'Sandstorm',
		id: 'sandstorm',
		num: 0,
		effectType: 'Weather',
		duration: 5,
		durationCallback: function (source, effect) {
			if (source && source.hasItem('smoothrock')) {
				return 8;
			}
			return 5;
		},
		// This should be applied directly to the stat before any of the other modifiers are chained
		// So we give it increased priority.
		onModifySpDPriority: 10,
		onModifySpD: function (spd, pokemon) {
			if (pokemon.hasType('Rock') && this.isWeather('sandstorm')) {
				return this.modify(spd, 1.5);
			}
		},
		onStart: function (battle, source, effect) {
			if (effect && effect.effectType === 'Ability') {
				if (this.gen <= 5) this.effectData.duration = 0;
				this.add('-weather', 'Sandstorm', '[from] ability: ' + effect, '[of] ' + source);
			} else {
				this.add('-weather', 'Sandstorm');
			}
		},
		onResidualOrder: 1,
		onResidual: function () {
			this.add('-weather', 'Sandstorm', '[upkeep]');
			if (this.isWeather('sandstorm')) this.eachEvent('Weather');
		},
		onWeather: function (target) {
			this.damage(target.maxhp / 16);
		},
		onEnd: function () {
			this.add('-weather', 'none');
		},
	},
	hail: {
		name: 'Hail',
		id: 'hail',
		num: 0,
		effectType: 'Weather',
		duration: 5,
		durationCallback: function (source, effect) {
			if (source && source.hasItem('icyrock')) {
				return 8;
			}
			return 5;
		},
		onStart: function (battle, source, effect) {
			if (effect && effect.effectType === 'Ability') {
				if (this.gen <= 5) this.effectData.duration = 0;
				this.add('-weather', 'Hail', '[from] ability: ' + effect, '[of] ' + source);
			} else {
				this.add('-weather', 'Hail');
			}
		},
		onResidualOrder: 1,
		onResidual: function () {
			this.add('-weather', 'Hail', '[upkeep]');
			if (this.isWeather('hail')) this.eachEvent('Weather');
		},
		onWeather: function (target) {
			this.damage(target.maxhp / 16);
		},
		onEnd: function () {
			this.add('-weather', 'none');
		},
	},
	deltastream: {
		name: 'DeltaStream',
		id: 'deltastream',
		num: 0,
		effectType: 'Weather',
		duration: 0,
		onEffectiveness: function (typeMod, target, type, move) {
			if (move && move.effectType === 'Move' && type === 'Flying' && typeMod > 0) {
				this.add('-activate', '', 'deltastream');
				return 0;
			}
		},
		onStart: function (battle, source, effect) {
			this.add('-weather', 'DeltaStream', '[from] ability: ' + effect, '[of] ' + source);
		},
		onResidualOrder: 1,
		onResidual: function () {
			this.add('-weather', 'DeltaStream', '[upkeep]');
			this.eachEvent('Weather');
		},
		onEnd: function () {
			this.add('-weather', 'none');
		},
	},

// Custom Abilities added for Aether
// Made by user Not Living Inside

	darkness: {
		name: 'Darkness',
		id: 'Darkness',
		num: 0,
		effectType: 'Weather',
		duration: 5,
		durationCallback: function (source, effect) {
			if (source && source.hasItem('voidrock')) {
				return 8;
			}
			return 5;
		},
		onWeatherModifyDamage: function (damage, attacker, defender, move) {
			if (move.type === 'Dark', 'Ghost') {
				this.debug('Darkness boost');
				return this.chainModify(1.5);
			}
			if (move.type === 'Fairy') {
				this.debug('Darkness fairy suppress');
				return this.chainModify(0.5);
			}
		},
		onStart: function (battle, source, effect) {
			if (effect && effect.effectType === 'Ability') {
				if (this.gen <= 5) this.effectData.duration = 0;
				this.add('-weather', 'Darkness', '[from] ability: ' + effect, '[of] ' + source);
			} else {
				this.add('-weather', 'Darkness');
			}
		},
		onResidualOrder: 1,
		onResidual: function () {
			this.add('-weather', 'Darkness', '[upkeep]');
			this.eachEvent('Weather');
		},
		onEnd: function () {
			this.add('-weather', 'none');
		},
	},
	hailstorm: {
		name: 'Hailstorm',
		id: 'hailstorm',
		num: 0,
		effectType: 'Weather',
		duration: 6,
		onEffectiveness: function (typeMod, target, type, move) {
			if (move && move.effectType === 'Move' && type === 'Ice' && typeMod > 0) {
				this.add('-activate', '', 'hailstorm');
        this.debug('Hailstorm Ice weakness negate');
				return 0;
			}
		},
		onWeatherModifyDamage: function (damage, attacker, defender, move) {
			if (move.type === 'Ice') {
				this.debug('Hailstorm Ice boost');
				return this.chainModify(1.1);
			}
		},
		onStart: function (battle, source, effect) {
			if (effect && effect.effectType === 'Ability') {
				if (this.gen <= 5) this.effectData.duration = 0;
				this.add('-weather', 'hailstorm', '[from] ability: ' + effect, '[of] ' + source);
			} else {
				this.add('-weather', 'hailstorm');
			}
		},
		onResidualOrder: 1,
		onResidual: function () {
			this.add('-weather', 'hailstorm', '[upkeep]');
			this.eachEvent('Weather');
		},
		onWeather: function (target) {
			this.damage(target.maxhp / 12);
		},
		onEnd: function () {
			this.add('-weather', 'none');
		},
	},
  thevoid: {
		name: 'The Void',
		id: 'thevoid',
		num: 0,
		effectType: 'Weather',
		duration: 0,
		onTryMove: function (target, source, effect) {
			if (effect.type === 'Fairy' && effect.category !== 'Status') {
				this.debug('The Void, Fairy suppress');
				this.add('-fail', source, effect, '[from] The Void');
				return null;
			}
		},
		onWeatherModifyDamage: function (damage, attacker, defender, move) {
			if (move.type === 'Ghost', 'Dark') {
				this.debug('The Void Ghost & Dark boost');
				return this.chainModify(1.5);
			}
		},
		onStart: function (battle, source, effect) {
			this.add('-weather', 'The Void', '[from] ability: ' + effect, '[of] ' + source);
		},
		onImmunity: function (type) {
			if (type === 'flinch', 'trapped') return false;
		},
		onResidualOrder: 1,
		onResidual: function () {
			this.add('-weather', 'The Void', '[upkeep]');
			this.eachEvent('Weather');
		},
    onWeather: function (target) {
			this.damage(target.maxhp / 12);
		},
		onEnd: function () {
			this.add('-weather', 'none');
		},
	},

  // Arceus and Silvally's actual typing is implemented here.
  // Their true typing for all their formes is Normal, and it's only
  // Multitype and RKS System, respectively, that changes their type,
  // but their formes are specified to be their corresponding type
  // in the Pokedex, so that needs to be overridden.
  // This is mainly relevant for Hackmons Cup and Balanced Hackmons.
  arceus: {
    name: "Arceus",
    id: "arceus",
    num: 493,
    onTypePriority: 1,
    onType: function(types, pokemon) {
      if (pokemon.transformed) return types;
      /** @type {string | undefined} */
      let type = "Normal";
      if (pokemon.ability === "multitype") {
        type = pokemon.getItem().onPlate;
        if (!type) {
          type = "Normal";
        }
      }
      return [type];
    }
  },
  silvally: {
    name: "Silvally",
    id: "silvally",
    num: 773,
    onTypePriority: 1,
    onType: function(types, pokemon) {
      if (pokemon.transformed) return types;
      /** @type {string | undefined} */
      let type = "Normal";
      if (pokemon.ability === "rkssystem") {
        type = pokemon.getItem().onMemory;
        if (!type) {
          type = "Normal";
        }
      }
      return [type];
    }
  }
};

exports.BattleStatuses = BattleStatuses;
