<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * quibbles implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 *
 * quibbles.action.php
 *
 * quibbles main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/quibbles/quibbles/myAction.html", ...)
 *
 */


class action_quibbles extends APP_GameAction
{
    // Constructor: please do not modify
    public function __default()
    {
        if (self::isArg('notifwindow')) {
            $this->view = "common_notifwindow";
            $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
        } else {
            $this->view = "quibbles_quibbles";
            self::trace("Complete reinitialization of board game");
        }
    }

    public function chooseAction()
    {
        self::setAjaxMode();

        $action = self::getArg("chosenAction", AT_alphanum, true);
        $this->game->chooseAction($action);

        self::ajaxResponse();
    }

    public function undoLastMoves() {
        self::setAjaxMode();

        $this->game->undoLastMoves();

        self::ajaxResponse();
    }

    public function takeConfirmDiscard() {
        self::setAjaxMode();

        $cardIds = self::getArg('cardIds', AT_json, true);
        $this->validateJSonAlphaNum($cardIds, 'cardIds');

        $this->game->takeConfirmDiscard($cardIds);

        self::ajaxResponse();
    }

    public function takeConfirm() {
        self::setAjaxMode();

        $selectedSets = self::getArg('selectedSets', AT_json, true);
        $this->validateJSonAlphaNum($selectedSets, 'selectedSets');

        $this->game->takeConfirm($selectedSets);

        self::ajaxResponse();
    }

    public function addCardToCollection() {
        self::setAjaxMode();

        $type = self::getArg("type", AT_posint, true);
        $cardIdToDiscard = self::getArg("cardIdToDiscard", AT_posint, false);

        $this->game->addCardToCollection($type, $cardIdToDiscard);

        self::ajaxResponse();
    }

    public function endTurn() {
        self::setAjaxMode();

        $this->game->endTurn();

        self::ajaxResponse();
    }

    public function pass() {
        self::setAjaxMode();

        $cardId = self::getArg('cardId', AT_posint, false);
        $this->game->pass($cardId);

        self::ajaxResponse();
    }

    private function validateJSonAlphaNum($value, $argName = 'unknown')
    {
        if (is_array($value)) {
            foreach ($value as $key => $v) {
                $this->validateJSonAlphaNum($key, $argName);
                $this->validateJSonAlphaNum($v, $argName);
            }
            return true;
        }
        if (is_int($value)) {
            return true;
        }

        $bValid = preg_match("/^[_0-9a-zA-Z- ]*$/", $value) === 1; // NOI18N
        if (!$bValid) {
            throw new BgaSystemException("Bad value for: $argName", true, true, FEX_bad_input_argument);
        }
        return true;
    }

}
  

