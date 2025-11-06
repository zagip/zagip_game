package ru.vlppz.zgbackend.Controllers.Admin.Code;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.vlppz.zgbackend.DB.Code.Code;
import ru.vlppz.zgbackend.DB.Code.CodeRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/code")
public class AdminCodeController {
    @Autowired
    private CodeRepository codeRepository;

    @PostMapping("/create")
    public ResponseEntity<CodeCreateResponse> createCode(@RequestBody CodeCreateRequest request) {
        CodeCreateResponse response = new CodeCreateResponse();
        
        try {
            Code code = new Code();
            code.setCode(request.code != null ? request.code : generateRandomCode());
            code.setReward(request.reward);
            code.setMaxUses(request.maxUses);
            code.setCurrentUses(0);
            code.setActive(true);
            code.setCreatedAt(LocalDateTime.now());
            
            Code savedCode = codeRepository.save(code);
            
            response.status = "ok";
            response.message = "Код создан успешно";
            response.code = savedCode;
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<CodeListResponse> getAllCodes() {
        CodeListResponse response = new CodeListResponse();
        response.codes = codeRepository.findAll().stream().toList();
        return ResponseEntity.ok().body(response);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<CodeDeleteResponse> deleteCode(@RequestBody CodeDeleteRequest request) {
        CodeDeleteResponse response = new CodeDeleteResponse();
        
        try {
            if (!codeRepository.existsById(request.id)) {
                response.status = "error";
                response.error = "Код не найден";
                return ResponseEntity.badRequest().body(response);
            }
            
            codeRepository.deleteById(request.id);
            
            response.status = "ok";
            response.message = "Код успешно удален";
            
            return ResponseEntity.ok().body(response);
            
        } catch (Exception e) {
            response.status = "error";
            response.error = e.getMessage();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private String generateRandomCode() {
        return "CODE" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}